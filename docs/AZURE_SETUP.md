# Azure Cloud Infrastructure Setup Guide

This guide walks you step-by-step through setting up the Azure cloud resources in the [Azure Portal](https://portal.azure.com).
Every step is marked **[HUMAN]** because it requires portal actions and account permissions.

---

### Step 1: Resource Group [HUMAN]
1. In the search bar at the top of Azure Portal, type `Resource groups` and select it.
2. Click **+ Create**.
3. Select your subscription.
4. Set **Resource group name**: `rg-ai-interview-coach`.
5. Select a region close to you (e.g., `East US` or `Central India`).
6. Click **Review + create** -> **Create**.

---

### Step 2: Azure OpenAI / AI Foundry [HUMAN]
1. Search for **Azure OpenAI** in the portal search bar.
2. Click **+ Create**.
3. Choose Resource Group: `rg-ai-interview-coach`.
4. Choose an available region (e.g., `East US`).
5. Set Name: `oai-interview-coach-<yourname>`.
6. Select Pricing tier: `Standard S0`. Click **Next** -> **Create**.
7. Once deployed, open the resource and go to **Keys and Endpoint** (left menu):
   - Copy **Endpoint** -> save to `.env.local` as `AZURE_OPENAI_ENDPOINT`.
   - Copy **KEY 1** -> save to `.env.local` as `AZURE_OPENAI_API_KEY`.
8. Click **Model deployments** (or open Azure AI Foundry / Azure OpenAI Studio):
   - Click **Deploy model** -> **Deploy base model**.
   - Select `gpt-4o-mini` (or `gpt-4o`).
   - Deployment name: `gpt-4o-mini` (or your chosen name).
   - Save this deployment name to `.env.local` as `AZURE_OPENAI_DEPLOYMENT`.
   - Set `AZURE_OPENAI_API_VERSION=2024-08-01-preview` (or current supported GA version).

---

### Step 3: Azure SQL Database [HUMAN]
1. Search for **SQL databases** in the portal search bar -> Click **+ Create**.
2. Resource Group: `rg-ai-interview-coach`.
3. Database name: `sqldb-interview-coach`.
4. Under Server, click **Create new**:
   - Server name: `sql-interview-coach-<yourname>` (globally unique).
   - Location: same region as resource group.
   - Authentication method: **Use SQL authentication**.
   - Server admin login: e.g. `cloudadmin`.
   - Password: a strong password.
   - Click **OK**.
5. Compute + storage: Select **General Purpose - Serverless** (auto-pause enabled to minimize cloud costs).
6. Click **Review + create** -> **Create**.
7. **Configure Firewall**:
   - Go to the SQL Server resource -> **Networking** (left menu).
   - Under Public access, select **Selected networks**.
   - Click **+ Add your client IPv4 address** (allows your local machine to connect).
   - Check **Allow Azure services and resources to access this server** (required for App Service & Azure Functions).
   - Click **Save**.
8. **Run Schema**:
   - Go back to `sqldb-interview-coach` -> **Query editor (preview)**.
   - Login with SQL admin credentials.
   - Open and paste the contents of `db/schema.sql` into the editor.
   - Click **Run**. Verify tables `users`, `resumes`, `interviews`, `questions`, `answers` are created.
9. Save connection details in `.env.local`:
   - `AZURE_SQL_SERVER=<server-name>.database.windows.net`
   - `AZURE_SQL_DATABASE=sqldb-interview-coach`
   - `AZURE_SQL_USER=cloudadmin`
   - `AZURE_SQL_PASSWORD=<your-strong-password>`

---

### Step 4: Azure Blob Storage [HUMAN]
1. Search for **Storage accounts** -> Click **+ Create**.
2. Resource Group: `rg-ai-interview-coach`.
3. Storage account name: `stinterviewcoach<yourname>` (lowercase letters and numbers only).
4. Performance: **Standard**, Redundancy: **Locally-redundant storage (LRS)**.
5. In **Advanced** tab: Ensure **Allow enabling public access on individual blobs** is **Disabled** (private only!).
6. Click **Review + create** -> **Create**.
7. Once deployed:
   - Go to **Containers** (left menu) -> Click **+ Container**.
   - Name: `resumes`.
   - Public access level: **Private (no anonymous access)**.
   - Click **Create**.
8. Go to **Access keys** (left menu):
   - Under `key1`, copy the **Connection string**.
   - Save to `.env.local` as `AZURE_STORAGE_CONNECTION_STRING`.
   - Set `AZURE_STORAGE_CONTAINER=resumes`.

---

### Step 5: Application Insights (Workspace-based) [HUMAN]
1. Search for **Application Insights** -> Click **+ Create**.
2. Resource Group: `rg-ai-interview-coach`.
3. Name: `appi-interview-coach`.
4. Log Analytics Workspace: Default workspace created automatically.
5. Click **Review + create** -> **Create**.
6. Once deployed, open the resource:
   - Copy **Connection String**.
   - Save to `.env.local` as `APPLICATIONINSIGHTS_CONNECTION_STRING`.

---

### Step 6: Azure Function App (Phase 6) [HUMAN]
1. Search for **Function App** -> Click **+ Create**.
2. Resource Group: `rg-ai-interview-coach`.
3. Function App name: `func-interview-coach-<yourname>`.
4. Runtime stack: **Node.js**, Version: **20 LTS** (or Node 22 LTS).
5. Operating System: **Linux**.
6. Hosting plan: **Consumption (Serverless)**.
7. Storage: Select the storage account created in Step 4 or create a dedicated consumption storage account.
8. Monitoring: Link to `appi-interview-coach`.
9. Click **Review + create** -> **Create**.
10. Once deployed:
    - Go to **App keys** (left menu) -> Copy the `default` host key.
    - Save to `.env.local` as `AZURE_FUNCTIONS_KEY`.
    - Set `AZURE_FUNCTIONS_BASE_URL=https://func-interview-coach-<yourname>.azurewebsites.net`.

---

### Step 7: Azure App Service (Phase 7) [HUMAN]
1. Search for **App Services** -> Click **+ Create** -> **Web App**.
2. Resource Group: `rg-ai-interview-coach`.
3. Name: `app-interview-coach-<yourname>`.
4. Publish: **Code**, Runtime stack: **Node 20 LTS** (or matching Node LTS), OS: **Linux**.
5. Pricing plan: **Basic B1** or **Free F1** (note: Free tier has limited CPU minutes per day; Basic B1 is recommended for smooth demo).
6. Click **Review + create** -> **Create**.
7. Startup Command: In **Configuration** -> **General settings**, set Startup Command: `node server.js`.

---

### Step 8: Cost Management & Clean-up [HUMAN]
- **Cost Alert**: In Azure Portal, search for `Cost Management + Billing` -> **Budgets** -> Create a $10–$20 budget alert.
- **Teardown**: When your project submission and viva are completely finished, navigate to Resource Groups -> `rg-ai-interview-coach` -> Click **Delete resource group** to instantly delete all resources and stop any future billing.
