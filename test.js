const noderfc = require('node-rfc');
require('dotenv').config();

console.log('════════════════════════════════════════════════════');
console.log('  WebSocket RFC Connection Test');
console.log('════════════════════════════════════════════════════\n');

// Load SAP Cryptographic Library (required for HTTPS)
try {
  noderfc.loadCryptoLibrary(process.env.SAP_CRYPTO_LIB);
  console.log('✅ Crypto library loaded successfully');
  console.log('   Path:', process.env.SAP_CRYPTO_LIB);
} catch (error) {
  console.error('❌ Failed to load crypto library');
  console.error('   Error:', error.message);
  console.error('   Path:', process.env.SAP_CRYPTO_LIB);
  console.error('\n⚠️  Check if crypto library file exists at this path');
  process.exit(1);
}

// WebSocket RFC Connection Parameters
const connectionParams = {
  wshost: process.env.SAP_WSHOST,
  wsport: process.env.SAP_WSPORT,
  client: process.env.SAP_CLIENT,
  user: process.env.SAP_USER,
  passwd: process.env.SAP_PASSWORD,
  lang: process.env.SAP_LANG,
};

console.log('\n📡 Connection Parameters:');
console.log('   Host:', connectionParams.wshost);
console.log('   Port:', connectionParams.wsport);
console.log('   Client:', connectionParams.client);
console.log('   User:', connectionParams.user);
console.log('   Language:', connectionParams.lang);

async function testConnection() {
  const client = new noderfc.Client(connectionParams);
  
  try {
    console.log('\n🔌 Attempting to connect via WebSocket RFC...');
    await client.open();
    console.log('✅ Connected successfully!\n');
    
    // Get connection information
    console.log('📊 Connection Information:');
    const info = await client.connectionInfo();
    console.log('   System ID:', info.sysId || 'N/A');
    console.log('   System Number:', info.sysNumber || 'N/A');
    console.log('   Partner Host:', info.partnerHost || 'N/A');
    console.log('   Release:', info.releaseversion || 'N/A');
    console.log('   RFC Protocol:', info.rfcProtocol || 'N/A');
    
    // Test ping
    console.log('\n🏓 Testing ping...');
    await client.ping();
    console.log('✅ Ping successful!');
    
    console.log('\n════════════════════════════════════════════════════');
    console.log('✅ WebSocket RFC is working perfectly!');
    console.log('   You can now call standard BAPIs and Function Modules');
    console.log('════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    
    console.error('\n🔍 Troubleshooting:');
    
    if (error.message.includes('Connection refused') || error.message.includes('host')) {
      console.error('   1. Check if WebSocket RFC services are running');
      console.error('      → SAP: Transaction SMICM → Goto → Services');
      console.error('   2. Verify host and port are correct');
      console.error('   3. Check firewall allows connection to port', connectionParams.wsport);
    } else if (error.message.includes('authentication') || error.message.includes('logon')) {
      console.error('   1. Verify username and password are correct');
      console.error('   2. Check if user is locked → SAP: Transaction SU01');
      console.error('   3. Verify client number is correct (210)');
    } else if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.error('   1. Check crypto library path in .env file');
      console.error('   2. Verify crypto library file exists');
      console.error('   3. Try using HTTP port 8000 instead of HTTPS');
    } else {
      console.error('   1. Check SAP system is running');
      console.error('   2. Verify SICF service is activated');
      console.error('      → SAP: Transaction SICF → /sap/bc/srt/rfc/sap');
      console.error('   3. Check system logs');
      console.error('      → SAP: Transaction SM21');
    }
    
    console.error('\n════════════════════════════════════════════════════\n');
    process.exit(1);
  } finally {
    if (client.alive) {
      await client.close();
      console.log('🔌 Connection closed');
    }
  }
}

testConnection();