# GitHub Variables Setup Guide

ตั้งค่า Repository Variables ต่อไปนี้ใน:
**Settings → Secrets and variables → Actions → Variables**

## Required Variables

| Variable | Description | Example |
|---|---|---|
| `WORKFLOW_PROJECT_ID` | GitHub Project V2 Node ID | `PVT_kwHO...` |
| `WORKFLOW_STATUS_FIELD_ID` | Status field Node ID | `PVTSSF_lAHO...` |
| `WORKFLOW_IN_PROGRESS_OPTION_ID` | "In Progress" option ID | `47fc9ee4` |
| `WORKFLOW_CODE_REVIEW_OPTION_ID` | "Code Review" option ID | `98ab1234` |
| `WORKFLOW_DONE_OPTION_ID` | "Done" option ID | `c1d2e3f4` |

## UAT Deploy Variables (ใช้โดย build-and-deploy.yml + update-uat-deploy.sh)

| Variable | Description | Example |
|---|---|---|
| `WORKFLOW_UAT_DEPLOY_STATUS_FIELD_ID` | "UAT Deploy Status" field Node ID | `PVTSSF_lAHO...` |
| `WORKFLOW_UAT_DEPLOY_VERSION_FIELD_ID` | "UAT Deploy Version" field Node ID | `PVTF_lAHO...` |
| `WORKFLOW_DEPLOYING_OPTION_ID` | "Deploying" option ID | `e72b49d5` |
| `WORKFLOW_DEPLOY_SUCCESS_OPTION_ID` | "Success" option ID | `c8db7e50` |
| `WORKFLOW_DEPLOY_FAILED_OPTION_ID` | "Failed" option ID | `62156152` |

> สร้าง field เหล่านี้อัตโนมัติโดยรัน `.\ tools\setup-uat-fields.ps1`

## PROD Deploy Variables (ใช้โดย build-and-deploy.yml + update-prod-deploy.sh)

| Variable | Description | Example |
|---|---|---|
| `WORKFLOW_PROD_DEPLOY_STATUS_FIELD_ID` | "PROD Deploy Status" field Node ID | `PVTSSF_lAHO...` |
| `WORKFLOW_PROD_DEPLOY_VERSION_FIELD_ID` | "PROD Deploy Version" field Node ID | `PVTF_lAHO...` |
| `WORKFLOW_PROD_DEPLOYING_OPTION_ID` | "Deploying" option ID | `a1b2c3d4` |
| `WORKFLOW_PROD_DEPLOY_SUCCESS_OPTION_ID` | "Success" option ID | `e5f6a7b8` |
| `WORKFLOW_PROD_DEPLOY_FAILED_OPTION_ID` | "Failed" option ID | `c9d0e1f2` |

> สร้าง field เหล่านี้ใน GitHub Project V2 ด้วยตนเอง แล้วรัน `.\ tools\discover-ids.ps1` เพื่อหา IDs

| Secret | Description |
|---|---|
| `PAT_TOKEN` | GitHub Personal Access Token with `project` + `repo` + `workflow` scopes |
| `FLY_API_TOKEN` | fly.io deploy token — ได้จาก `flyctl auth token` |

## วิธีหา Node IDs

รันผ่าน GitHub CLI:

```bash
# หา Project ID
gh api graphql -f query='
  query($login: String!) {
    organization(login: $login) {
      projectsV2(first: 10) {
        nodes { id title }
      }
    }
  }
' -f login="YOUR_ORG"

# หา Field IDs และ Option IDs
gh api graphql -f query='
  query($project: ID!) {
    node(id: $project) {
      ... on ProjectV2 {
        fields(first: 20) {
          nodes {
            ... on ProjectV2SingleSelectField {
              id
              name
              options { id name }
            }
          }
        }
      }
    }
  }
' -f project="YOUR_PROJECT_ID"
```
