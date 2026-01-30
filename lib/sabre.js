
import axios from 'axios';

const SABRE_REST_PROD = 'https://api.platform.sabre.com';
const SABRE_REST_CERT = 'https://api.cert.platform.sabre.com';

const getEnv = () => {
  return {
    userId: process.env.SABRE_USER_ID,
    group: process.env.SABRE_GROUP,
    domain: process.env.SABRE_DOMAIN,
    clientSecret: process.env.SABRE_CLIENT_SECRET,
    environment: process.env.SABRE_ENVIRONMENT
  };
};

const getBaseUrl = () => {
  const { environment } = getEnv();
  return environment === 'production' ? SABRE_REST_PROD : SABRE_REST_CERT;
};

/**
 * Generates the Basic Auth token string required to get the Access Token.
 * Format: Base64( Base64(V1:user:group:domain) + ":" + Base64(secret) )
 */
const getAuthCredentials = () => {
  const { userId, group, domain, clientSecret } = getEnv();
  
  const clientId = `V1:${userId}:${group}:${domain}`;
  const encodedClientId = Buffer.from(clientId).toString('base64');
  const encodedClientSecret = Buffer.from(clientSecret).toString('base64');
  
  const authString = `${encodedClientId}:${encodedClientSecret}`;
  return Buffer.from(authString).toString('base64');
};

/**
 * Fetches a valid Sabre OAuth token.
 * Ideally, this should be cached in a real production environment (e.g., Redis).
 */
export const getSabreToken = async () => {
  try {
    const auth = getAuthCredentials();
    const baseUrl = getBaseUrl();
    
    const response = await axios.post(
      `${baseUrl}/v2/auth/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Sabre Auth Error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Sabre');
  }
};

/**
 * Creates a PNR (Passenger Name Record)
 */
export const createPNR = async (bookingRequest) => {
  try {
    const token = await getSabreToken();
    const baseUrl = getBaseUrl();
    const { flight, passenger } = bookingRequest;

    // Extract segments from the selected flight itinerary
    // In a real scenario, you'd likely re-validate here first using /v4/shop/flights/revalidate
    // to ensure the price/inventory hasn't changed.
    
    const segments = [];
    flight.AirItinerary.OriginDestinationOptions.OriginDestinationOption.forEach(leg => {
      leg.FlightSegment.forEach(seg => {
        segments.push({
          DepartureDateTime: seg.DepartureDateTime,
          ArrivalDateTime: seg.ArrivalDateTime,
          FlightNumber: seg.FlightNumber,
          NumberInParty: "1",
          ResBookDesigCode: seg.ResBookDesigCode, // Booking Class (e.g., Y, Q)
          Status: "NN", // Need Need (Requesting seat)
          OriginLocation: { LocationCode: seg.DepartureAirport.LocationCode },
          DestinationLocation: { LocationCode: seg.ArrivalAirport.LocationCode },
          MarketingAirline: { Code: seg.MarketingAirline.Code, FlightNumber: seg.FlightNumber }
        });
      });
    });

    const payload = {
      CreatePassengerNameRecordRQ: {
        version: "2.4.0",
        targetCity: getEnv().group,
        TravelItineraryAddInfo: {
          AgencyInfo: {
            Address: {
              AddressLine: "FlyOval OTA Booking",
              CityName: "Dhaka",
              CountryCode: "BD",
              PostalCode: "1207",
              StateCountyProv: { StateCode: "DHK" },
              StreetNmbr: "Nest Osmium Tower"
            },
            Ticketing: { TicketType: "7T-A" } // Time Limit
          },
          CustomerInfo: {
            ContactNumbers: {
              ContactNumber: [{ Phone: passenger.phone, PhoneUseType: "H" }]
            },
            PersonName: [{
              NameNumber: "1.1",
              GivenName: passenger.firstName.toUpperCase(),
              Surname: passenger.lastName.toUpperCase(),
              NameReference: passenger.title
            }],
            Email: [{ Address: passenger.email }]
          }
        },
        AirBook: {
          HaltOnStatus: [{ Code: "UC" }, { Code: "LL" }, { Code: "UL" }, { Code: "UN" }, { Code: "NO" }, { Code: "HX" }],
          OriginDestinationInformation: {
            FlightSegment: segments
          },
          RedisplayReservation: { NumAttempts: 10, WaitInterval: 2000 }
        },
        PostProcessing: {
          EndTransaction: {
            Source: { ReceivedFrom: "FlyOval Web" }
          }
        }
      }
    };

    const response = await axios.post(
      `${baseUrl}/v2.4.0/passenger/records?mode=create`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Create PNR Error:', error.response?.data || error.message);
    throw error.response?.data || new Error('Booking failed');
  }
};
/**
 * Searches for flights using Bargain Finder Max (BFM) v1
 */
export const searchFlights = async (searchRequest) => {
  try {
    const token = await getSabreToken();
    const baseUrl = getBaseUrl();
    
    // Ensure strict production rules
    const { origin, destination, departureDate, returnDate, passengers } = searchRequest;
    
    // Format payload for Sabre BFM (using v1 fallback with specific object format)
    
    // Helper to format date for v1 endpoint: { content: "YYYY-MM-DDTHH:MM:SS" }
    const formatSabreDate = (dateStr) => {
      // dateStr is YYYY-MM-DD, append T00:00:00
      return { content: `${dateStr}T00:00:00` };
    };

    const requestPayload = {
      OTA_AirLowFareSearchRQ: {
        Version: "1.0.0", // Ignored by v1 usually, but good to reset
        POS: {
          Source: [
            {
              PseudoCityCode: getEnv().group,
              RequestorID: {
                Type: "1",
                ID: "1",
                CompanyName: {
                  Code: "TN"
                }
              }
            }
          ]
        },
        OriginDestinationInformation: [
          {
            RPH: "1",
            DepartureDateTime: formatSabreDate(departureDate),
            OriginLocation: { LocationCode: origin },
            DestinationLocation: { LocationCode: destination },
            TPA_Extensions: {
              SegmentType: { Code: "O" }
            }
          }
        ],
        TravelerInfoSummary: {
          AirTravelerAvail: [
            {
              PassengerTypeQuantity: [
                {
                  Code: "ADT",
                  Quantity: passengers || 1
                }
              ]
            }
          ]
        },
        TPA_Extensions: {
          IntelliSellTransaction: {
            RequestType: { Name: "50ITINS" }
          }
        }
      }
    };

    // Add return leg if roundtrip
    if (returnDate) {
      requestPayload.OTA_AirLowFareSearchRQ.OriginDestinationInformation.push({
        RPH: "2",
        DepartureDateTime: formatSabreDate(returnDate),
        OriginLocation: { LocationCode: destination },
        DestinationLocation: { LocationCode: origin },
        TPA_Extensions: {
          SegmentType: { Code: "O" }
        }
      });
    }

    const response = await axios.post(
      `${baseUrl}/v1/shop/flights?mode=live`,
      requestPayload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Sabre Search Error:', error.response?.data || error.message);
    // Return the error details for debugging if needed, or throw standard error
    throw error.response?.data || new Error('Flight search failed');
  }
};
