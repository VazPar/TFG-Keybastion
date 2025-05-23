/**
 * Script to fix TypeScript imports across the KeyBastion project
 * 
 * This script updates import statements in TypeScript files to use the centralized
 * type definitions from src/types/index.ts, fixing build errors related to missing exports.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files to update with their import replacements
const filesToUpdate = [
  {
    path: 'src/context/AuthContext.tsx',
    replacements: [
      {
        from: "import { UserCredentials, RegisterRequest, UserProfile } from '../services/type';",
        to: "import type { UserCredentials, RegisterRequest, UserProfile } from '../types';"
      },
      {
        from: "import { TokenPayload } from '../utils/tokenUtils';",
        to: "import type { TokenPayload } from '../types';"
      }
    ]
  },
  {
    path: 'src/services/api.ts',
    replacements: [
      {
        from: "import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from 'axios';",
        to: "import axios from 'axios';\nimport type { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from '../types';"
      }
    ]
  },
  {
    path: 'src/services/authService.ts',
    replacements: [
      {
        from: "import { TokenPayload } from '../utils/tokenUtils';",
        to: "import type { TokenPayload } from '../types';"
      },
      {
        from: "import { LoginResponse, UserCredentials, RegisterRequest } from './type';",
        to: "import type { LoginResponse, UserCredentials, RegisterRequest } from '../types';"
      }
    ]
  },
  {
    path: 'src/services/credentialService.ts',
    replacements: [
      {
        from: "import { Category } from './categoryService';",
        to: "import type { Category } from '../types';"
      }
    ]
  },
  {
    path: 'src/pages/Dashboard.tsx',
    replacements: [
      {
        from: "import { DashboardStats } from '../services/credentialService';",
        to: "import type { DashboardStats } from '../types';"
      },
      {
        from: "import { RecentActivity } from '../services/activityService';",
        to: "import type { RecentActivity } from '../types';"
      }
    ]
  },
  {
    path: 'src/hooks/usePasswordGenerator.ts',
    replacements: [
      {
        from: "import { CategoryType } from '../services/categoryService';",
        to: "import type { CategoryType } from '../types';\nimport { CATEGORY_TYPES } from '../types';"
      }
    ]
  },
  {
    path: 'src/services/sharingService.ts',
    replacements: [
      {
        from: "import { Credential } from './credentialService';",
        to: "import type { Credential } from '../types';"
      }
    ]
  },
  {
    path: 'src/pages/Passwords.tsx',
    replacements: [
      {
        from: "import { CredentialsResponse } from '../services/credentialService';",
        to: "import type { CredentialsResponse } from '../types';"
      }
    ]
  },
  {
    path: 'src/pages/AddExistingPassword.tsx',
    replacements: [
      {
        from: "import { Category, CategoryType } from '../services/categoryService';",
        to: "import type { Category, CategoryType } from '../types';\nimport { CATEGORY_TYPES } from '../types';"
      }
    ]
  },
  {
    path: 'src/pages/EditPassword.tsx',
    replacements: [
      {
        from: "import { Category } from '../services/categoryService';",
        to: "import type { Category } from '../types';"
      },
      {
        from: "import { Credential, SaveCredentialRequest } from '../services/credentialService';",
        to: "import type { Credential, SaveCredentialRequest } from '../types';"
      }
    ]
  },
  {
    path: 'src/pages/SharedCredentials.tsx',
    replacements: [
      {
        from: "import { SharedCredentialDetail } from '../services/sharingService';",
        to: "import type { SharedCredentialDetail } from '../types';"
      }
    ]
  },
  {
    path: 'src/pages/AdminDashboard.tsx',
    replacements: [
      {
        from: "import { User, ActivityLog, CategoryStatsResponse, SharingStatsResponse } from '../services/adminService';",
        to: "import type { User, ActivityLog, CategoryStatsResponse, SharingStatsResponse } from '../types';"
      }
    ]
  },
  {
    path: 'src/pages/AdminActivity.tsx',
    replacements: [
      {
        from: "import { ActivityLog } from '../services/adminService';",
        to: "import type { ActivityLog } from '../types';"
      }
    ]
  },
  {
    path: 'src/pages/AdminUsers.tsx',
    replacements: [
      {
        from: "import type { User } from '../services/adminService';",
        to: "import type { User } from '../types';"
      }
    ]
  }
];

// Function to update a file with the specified replacements
function updateFile(filePath, replacements) {
  const fullPath = path.resolve(__dirname, filePath);
  
  try {
    // Read the file content
    let content = fs.readFileSync(fullPath, 'utf8');
    let updated = false;
    
    // Apply each replacement
    for (const replacement of replacements) {
      if (content.includes(replacement.from)) {
        content = content.replace(replacement.from, replacement.to);
        updated = true;
        console.log(`✅ Updated import in ${filePath}`);
      }
    }
    
    if (updated) {
      // Write the updated content back to the file
      fs.writeFileSync(fullPath, content, 'utf8');
    } else {
      console.log(`⚠️ No replacements made in ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Process all files
console.log('🔍 Starting import fixes...');
filesToUpdate.forEach(file => {
  updateFile(file.path, file.replacements);
});
console.log('✨ Import fixes completed!');
