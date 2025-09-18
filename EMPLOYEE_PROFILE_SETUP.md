# Employee Profile Collection Setup for Directus

## Collection: `employee_profile`

This collection needs to be created in your Directus instance to support the profile management functionality.

### Database Relationship:
- The `directus_users` table has an `employee_profile_id` field that links to the `employee_profile` collection
- This is a One-to-One relationship where one user can have one employee profile

### Required Fields:

1. **id** (Primary Key)
   - Type: UUID
   - Auto-generated

2. **mobile_number**
   - Type: String
   - Interface: Input
   - Optional

3. **ewallet_number**
   - Type: String
   - Interface: Input
   - Optional

4. **ewallet_type**
   - Type: String
   - Interface: Dropdown
   - Options: `gcash`, `maya`
   - Default: `gcash`

5. **hourly_rate**
   - Type: Decimal (10,2)
   - Interface: Input
   - Default: 0.00

6. **overtime_multiplier**
   - Type: Decimal (3,1)
   - Interface: Input
   - Default: 1.5

7. **wallet_balance**
   - Type: Decimal (10,2)
   - Interface: Input
   - Default: 0.00
   - Read-only for employees (can be edited by admin)

### User Table Modification:

You also need to add an `employee_profile_id` field to the `directus_users` collection:

1. **employee_profile_id**
   - Type: UUID
   - Interface: Many-to-One
   - Related Collection: `employee_profile`
   - Optional: Yes

9. **date_created**
   - Type: Timestamp
   - Auto-generated

10. **date_updated**
    - Type: Timestamp
    - Auto-updated

### Collection Permissions:

#### For Employee Role:
- **Create**: Allow (to create their own profile)
- **Read**: Allow (all records - filtering handled by app logic)
- **Update**: Allow (all records - filtering handled by app logic)
  - Exclude `wallet_balance` from update permissions
- **Delete**: Deny

#### For Administrator Role:
- **Create**: Allow
- **Read**: Allow (all records)
- **Update**: Allow (all records)
- **Delete**: Allow

### SQL Creation Scripts:

#### 1. Create Employee Profile Collection:

```sql
CREATE TABLE employee_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile_number VARCHAR(20),
    ewallet_number VARCHAR(20),
    ewallet_type VARCHAR(10) DEFAULT 'gcash',
    hourly_rate DECIMAL(10,2) DEFAULT 0.00,
    overtime_multiplier DECIMAL(3,1) DEFAULT 1.5,
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add constraint for ewallet_type
ALTER TABLE employee_profile 
ADD CONSTRAINT check_ewallet_type 
CHECK (ewallet_type IN ('gcash', 'maya'));
```

#### 2. Add Employee Profile ID to Users Table:

```sql
-- Add employee_profile_id column to directus_users
ALTER TABLE directus_users 
ADD COLUMN employee_profile_id UUID;

-- Add foreign key constraint
ALTER TABLE directus_users 
ADD CONSTRAINT fk_user_employee_profile 
FOREIGN KEY (employee_profile_id) REFERENCES employee_profile(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX idx_users_employee_profile_id ON directus_users(employee_profile_id);
```
```

## Features Implemented:

1. **User Profile Management**
   - Edit first name, last name, email
   - Upload and change avatar image
   - Real-time updates to auth store

2. **Employee Profile Management**
   - Create employee profile if none exists
   - Edit mobile number, e-wallet details
   - Set hourly rate and overtime multiplier
   - View current wallet balance (read-only)

3. **Avatar Upload**
   - File validation (image types only, max 5MB)
   - Direct upload to Directus files
   - Automatic profile update with new avatar

4. **Form Validation**
   - Required field validation
   - Email format validation
   - Number input validation for rates

5. **Responsive Design**
   - Mobile-friendly forms
   - Proper spacing and layout
   - Loading states and error handling

6. **User Experience**
   - Success/error message display
   - Loading spinners during operations
   - Smooth transitions and animations
