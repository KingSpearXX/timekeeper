// Script to create the employee_profiles collection in Directus
// Run this with: node create-employee-profiles.js

const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL || 'http://localhost:8055';

async function createEmployeeProfilesCollection() {
  try {
    // You'll need to get your admin token - check localStorage in browser
    const adminToken = 'YOUR_ADMIN_TOKEN_HERE'; // Replace this with your actual token
    
    console.log('Checking if employee_profiles collection exists...');
    
    // First, check if collection exists
    const checkResponse = await fetch(`${DIRECTUS_URL}/collections/employee_profiles`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (checkResponse.ok) {
      console.log('✅ employee_profiles collection already exists!');
      return;
    }
    
    console.log('Creating employee_profiles collection...');
    
    // Create the collection
    const createCollectionResponse = await fetch(`${DIRECTUS_URL}/collections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collection: 'employee_profiles',
        meta: {
          icon: 'person',
          display_template: '{{employee_profile_id.first_name}} {{employee_profile_id.last_name}} - Employee Profile',
          hidden: false,
          singleton: false,
          translations: [
            {
              language: 'en-US',
              translation: 'Employee Profiles'
            }
          ]
        },
        schema: {
          name: 'employee_profiles'
        }
      })
    });
    
    if (!createCollectionResponse.ok) {
      throw new Error(`Failed to create collection: ${createCollectionResponse.status}`);
    }
    
    console.log('✅ Collection created! Now creating fields...');
    
    // Create fields
    const fields = [
      {
        field: 'id',
        type: 'integer',
        meta: {
          hidden: true,
          interface: 'input',
          readonly: true
        },
        schema: {
          is_primary_key: true,
          has_auto_increment: true
        }
      },
      {
        field: 'employee_profile_id',
        type: 'uuid',
        meta: {
          interface: 'select-dropdown-m2o',
          display: 'related-values',
          display_options: {
            template: '{{first_name}} {{last_name}}'
          },
          special: ['m2o']
        },
        schema: {
          foreign_key_table: 'directus_users',
          foreign_key_column: 'id'
        }
      },
      {
        field: 'mobile_number',
        type: 'string',
        meta: {
          interface: 'input',
          width: 'half'
        }
      },
      {
        field: 'ewallet_type',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'GCash', value: 'gcash' },
              { text: 'Maya', value: 'maya' }
            ]
          },
          width: 'half'
        }
      },
      {
        field: 'ewallet_number',
        type: 'string',
        meta: {
          interface: 'input',
          width: 'half'
        }
      },
      {
        field: 'hourly_rate',
        type: 'decimal',
        meta: {
          interface: 'input',
          width: 'half'
        },
        schema: {
          numeric_precision: 10,
          numeric_scale: 2
        }
      },
      {
        field: 'overtime_multiplier',
        type: 'decimal',
        meta: {
          interface: 'input',
          width: 'half'
        },
        schema: {
          numeric_precision: 3,
          numeric_scale: 1,
          default_value: 1.5
        }
      },
      {
        field: 'wallet',
        type: 'decimal',
        meta: {
          interface: 'input',
          width: 'half',
          readonly: true
        },
        schema: {
          numeric_precision: 10,
          numeric_scale: 2,
          default_value: 0
        }
      }
    ];
    
    for (const field of fields) {
      const fieldResponse = await fetch(`${DIRECTUS_URL}/fields/employee_profiles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(field)
      });
      
      if (fieldResponse.ok) {
        console.log(`✅ Created field: ${field.field}`);
      } else {
        console.error(`❌ Failed to create field ${field.field}:`, await fieldResponse.text());
      }
    }
    
    console.log('✅ Employee profiles collection setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\nTo fix this:');
    console.log('1. Go to your browser');
    console.log('2. Open Developer Tools (F12)');
    console.log('3. Go to Application > Local Storage');
    console.log('4. Find "directus_token" and copy the value');
    console.log('5. Replace YOUR_ADMIN_TOKEN_HERE in this script with your token');
    console.log('6. Run: node create-employee-profiles.js');
  }
}

createEmployeeProfilesCollection();
