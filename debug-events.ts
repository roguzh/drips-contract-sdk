import { createDripsSDK } from "./dist/index";

/**
 * Debug event queries to understand why events aren't being found
 */
async function debugEventQueries() {
  console.log("🔍 Debugging Event Queries\n");

  const sdk = createDripsSDK("testnet");
  const config = sdk.getConfig();
  
  console.log(`📦 Package ID: ${config.packageId}`);
  console.log();

  const modulesToTry = [
    'events',
    'event_wrapper', 
    'raffle',
    'house'
  ];

  for (const module of modulesToTry) {
    console.log(`📅 Trying module: ${module}`);
    try {
      const events = await sdk.getClient().queryEvents({
        query: {
          MoveModule: {
            package: config.packageId,
            module: module
          }
        },
        limit: 5,
        order: 'descending'
      });
      
      console.log(`  ✅ Found ${events.data.length} events in ${module}`);
      
      if (events.data.length > 0) {
        events.data.forEach((event, index) => {
          console.log(`    Event ${index + 1}:`);
          console.log(`      Type: ${event.type}`);
          console.log(`      TX: ${event.id.txDigest}`);
          
          if (event.parsedJson) {
            console.log(`      Data: ${JSON.stringify(event.parsedJson, null, 2)}`);
          }
        });
      }
      
    } catch (error) {
      console.log(`  ❌ Module ${module} failed: ${error instanceof Error ? error.message : error}`);
    }
    console.log();
  }

  // Try a broader query - all events from the package
  console.log("🌐 Trying broader package query...");
  try {
    const allEvents = await sdk.getClient().queryEvents({
      query: {
        MoveEventType: `${config.packageId}::event_wrapper::Event`
      },
      limit: 10,
      order: 'descending'
    });
    
    console.log(`  📊 Found ${allEvents.data.length} event_wrapper events`);
    
    if (allEvents.data.length > 0) {
      allEvents.data.forEach((event, index) => {
        console.log(`    ${index + 1}. ${event.type}`);
        if (event.parsedJson && typeof event.parsedJson === 'object') {
          const parsed = event.parsedJson as any;
          const eventData = parsed.pos0 || parsed;
          if (eventData.raffle_id) {
            console.log(`       Raffle ID: ${eventData.raffle_id}`);
          }
        }
      });
    }
    
  } catch (error) {
    console.log(`  ❌ Event wrapper query failed: ${error instanceof Error ? error.message : error}`);
  }
}

// Run the debug
debugEventQueries().catch(console.error);
