import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST add new branch or PUT update existing branch
export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams; // Bank ID
    const body = await request.json();
    
    // Extract branch details
    const {
      district_name,
      routing_number,
      branch_name,
      branch_slug,
      branch_code,
      swift_code,
      address,
      telephone,
      email,
      fax,
      original_branch_code // Used for identifying branch in update mode (optional for create)
    } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Bank ID' }, { status: 400 });
    }

    if (!district_name || !branch_name || !routing_number) {
      return NextResponse.json({ error: 'District, Branch Name and Routing Number are required' }, { status: 400 });
    }

    const db = await getDb();
    const banksCollection = db.collection('bd_banks');

    const bank = await banksCollection.findOne({ _id: new ObjectId(id) });
    if (!bank) {
      return NextResponse.json({ error: 'Bank not found' }, { status: 404 });
    }

    const branchData = {
      routing_number,
      branch_name,
      branch_slug: branch_slug || branch_name.toUpperCase().replace(/\s+/g, '_'),
      branch_code,
      swift_code,
      address,
      telephone,
      email,
      fax
    };

    // Check if district exists
    const districtIndex = bank.districts.findIndex(d => d.district_name === district_name.toUpperCase());

    if (districtIndex > -1) {
      // District exists, push branch to it
      await banksCollection.updateOne(
        { _id: new ObjectId(id), "districts.district_name": district_name.toUpperCase() },
        { $push: { "districts.$.branches": branchData } }
      );
    } else {
      // Create new district with branch
      await banksCollection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $push: { 
            districts: {
              district_name: district_name.toUpperCase(),
              branches: [branchData]
            }
          } 
        }
      );
    }

    return NextResponse.json({ message: 'Branch added successfully' });

  } catch (error) {
    console.error('Error adding branch:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT update existing branch
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams; // Bank ID
    const body = await request.json();
    
    const {
      district_name,
      routing_number,
      branch_name,
      branch_slug,
      branch_code,
      swift_code,
      address,
      telephone,
      email,
      fax,
      original_branch_code 
    } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Bank ID' }, { status: 400 });
    }

    const db = await getDb();
    const banksCollection = db.collection('bd_banks');

    // Remove old branch entry first (simplest way to handle updates across districts)
    // In a real optimized scenario, we might want to check if district changed
    
    // 1. Pull the branch from wherever it was (using original routing number or code as identifier)
    // Note: Ideally we should use a unique ID for branches, but using properties for now as per schema
    
    // Complex update: We will use a pull-then-push approach for simplicity in this structure
    // Find the bank first to locate the branch
    const bank = await banksCollection.findOne({ _id: new ObjectId(id) });
    
    // Find coordinates of the branch to update
    let targetDistrictIndex = -1;
    let targetBranchIndex = -1;

    // Use original_branch_code to identify or fallback to routing number if not changing
    const identifierCode = original_branch_code || branch_code; 

    // Find the branch to remove
    // Note: This logic assumes we know where it is. For now, let's assume we pass the *old* district name if needed
    // But better: Just use the API for *Adding* new branches for now, handling Edit is complex without unique IDs for sub-documents.
    
    // Let's implement a simpler "Update specific branch by routing number" if that's the unique key
    
    // STRATEGY: 
    // Since we don't have unique branch IDs, editing deeply nested arrays is tricky.
    // We will assume 'routing_number' is unique enough or we rely on the frontend sending the exact state.
    // However, the robust way for this nested structure without IDs is:
    // 1. $pull the old branch object 
    // 2. $push the new branch object to the correct district
    
    // A better approach for this specific schema structure:
    // Since this is a "settings" page, maybe we just replace the whole district's branch list? 
    // No, that's dangerous.
    
    // Let's stick to: Update fields if we can match it.
    
    // Matching logic: match by district_name AND (branch_code OR routing_number)
    
    const query = {
      _id: new ObjectId(id),
      "districts.district_name": district_name
    };
    
    // If we are just updating details within the same district:
    await banksCollection.updateOne(
      { 
        _id: new ObjectId(id), 
        "districts": { 
          $elemMatch: { 
            "district_name": district_name, 
            "branches.branch_code": original_branch_code 
          } 
        } 
      },
      { 
        $set: { 
          "districts.$[d].branches.$[b].branch_name": branch_name,
          "districts.$[d].branches.$[b].routing_number": routing_number,
          "districts.$[d].branches.$[b].branch_slug": branch_slug,
          "districts.$[d].branches.$[b].branch_code": branch_code,
          "districts.$[d].branches.$[b].swift_code": swift_code,
          "districts.$[d].branches.$[b].address": address,
          "districts.$[d].branches.$[b].telephone": telephone,
          "districts.$[d].branches.$[b].email": email,
          "districts.$[d].branches.$[b].fax": fax
        } 
      },
      {
        arrayFilters: [
          { "d.district_name": district_name },
          { "b.branch_code": original_branch_code }
        ]
      }
    );

    return NextResponse.json({ message: 'Branch updated successfully' });

  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
