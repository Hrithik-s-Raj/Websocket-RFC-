// Secure WebSocket RFC Connection Test (WSS/TLS)
// ===============================================

const noderfc = require("node-rfc");
require("dotenv").config();

console.log("════════════════════════════════════════════════════");
console.log("  WebSocket RFC Connection Test (Secure TLS Mode)");
console.log("════════════════════════════════════════════════════\n");

// ----------------------------------------------------
// Load SAP Cryptographic Library
// ----------------------------------------------------
try {
  noderfc.loadCryptoLibrary(process.env.SAP_CRYPTO_LIB);
  console.log("✅ Crypto library loaded successfully");
  console.log("   Path:", process.env.SAP_CRYPTO_LIB);
} catch (error) {
  console.error("❌ Failed to load crypto library");
  console.error("   Error:", error.message);
  console.error("   Path:", process.env.SAP_CRYPTO_LIB);
  console.error("⚠️  Ensure sapcrypto.dll is accessible and VC++ 2013 x64 runtime is installed");
  process.exit(1);
}

// ----------------------------------------------------
// WebSocket RFC Connection Parameters
// ----------------------------------------------------
const connectionParams = {
  wshost: process.env.SAP_WSHOST,
  wsport: process.env.SAP_WSPORT,
  client: process.env.SAP_CLIENT,
  user: process.env.SAP_USER,
  passwd: process.env.SAP_PASSWORD,
  lang: process.env.SAP_LANG,
  tls_client_pse: process.env.SAPSSL_PSE,
  tls_client_pse_pin: process.env.SAPSSL_PSE_PIN,
};

console.log("📡 Connection Parameters:");
console.table(connectionParams);

async function testConnection() {
  const client = new noderfc.Client(connectionParams);

  try {
    console.log("\n🔌 Attempting to connect via Secure WebSocket RFC (WSS/TLS)...");
    await client.open();
    console.log("✅ Connected successfully over TLS!\n");

    // Connection info
    const info = await client.connectionInfo();
    console.log("📊 Connection Information:");
    console.table(info);

    // Test ping
    console.log("🏓 Testing ping...");
    await client.ping();
    console.log("✅ Ping successful!");

    console.log("\n════════════════════════════════════════════════════");
    console.log("✅ Secure WebSocket RFC is working perfectly!");
    console.log("   You can now call standard BAPIs and Function Modules");
    console.log("════════════════════════════════════════════════════\n");
  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error("Error:", error);
    console.error("\n🔍 Troubleshooting Guide:");

    if (error.message.includes("PSE") || error.message.includes("TLS")) {
      console.error("   1. Verify PSE file exists at:", process.env.SAPSSL_PSE);
      console.error("   2. Check SAPSSL_PSE_PIN matches the PSE password.");
      console.error("   3. Ensure sapcrypto.dll is loaded and PATH includes C:\\sap\\cryptolib");
      console.error("   4. Confirm WSS port (44300/4300) is active in SMICM → Services.");
    } else if (error.message.includes("authentication")) {
      console.error("   1. Check SAP user credentials and client number.");
      console.error("   2. Ensure user has RFC authorization (S_RFC).");
    } else {
      console.error("   1. Check ICM logs (SMICM → Goto → Trace File → Display All).");
      console.error("   2. Check system log (SM21) for WSS handshake errors.");
    }

    console.error("\n════════════════════════════════════════════════════\n");
    process.exit(1);
  } finally {
    if (client.alive) {
      await client.close();
      console.log("🔌 Connection closed");
    }
  }
}

testConnection();
