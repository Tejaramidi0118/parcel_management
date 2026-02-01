Write-Host "Testing all frontend endpoints..."
Write-Host ""

# Test 1: Cities
try {
    [{"id":2,"name":"Bangalore","state_id":1,"latitude":12.9716,"longitude":77.5946,"state_name":"Karnataka","state_code":"KA"},{"id":4,"name":"Delhi","state_id":3,"latitude":28.7041,"longitude":77.1025,"state_name":"Delhi","state_code":"DL"},{"id":3,"name":"Mumbai","state_id":2,"latitude":19.076,"longitude":72.8777,"state_name":"Maharashtra","state_code":"MH"}] = Invoke-WebRequest -Uri "http://localhost:3000/city" -UseBasicParsing -TimeoutSec 3
    Write-Host " /city - Status: 200"
} catch { Write-Host " /city - Failed: " }

# Test 2: Hubs
try {
    [{"id":2,"name":"Bangalore","state_id":1,"latitude":12.9716,"longitude":77.5946,"state_name":"Karnataka","state_code":"KA"},{"id":4,"name":"Delhi","state_id":3,"latitude":28.7041,"longitude":77.1025,"state_name":"Delhi","state_code":"DL"},{"id":3,"name":"Mumbai","state_id":2,"latitude":19.076,"longitude":72.8777,"state_name":"Maharashtra","state_code":"MH"}] = Invoke-WebRequest -Uri "http://localhost:3000/hub" -UseBasicParsing -TimeoutSec 3
    Write-Host " /hub - Status: 200"
} catch { Write-Host " /hub - Failed: " }

# Test 3: Vehicles
try {
    [{"id":2,"name":"Bangalore","state_id":1,"latitude":12.9716,"longitude":77.5946,"state_name":"Karnataka","state_code":"KA"},{"id":4,"name":"Delhi","state_id":3,"latitude":28.7041,"longitude":77.1025,"state_name":"Delhi","state_code":"DL"},{"id":3,"name":"Mumbai","state_id":2,"latitude":19.076,"longitude":72.8777,"state_name":"Maharashtra","state_code":"MH"}] = Invoke-WebRequest -Uri "http://localhost:3000/vehicle" -UseBasicParsing -TimeoutSec 3
    Write-Host " /vehicle - Status: 200"
} catch { Write-Host " /vehicle - Failed: " }

Write-Host ""
Write-Host "All tests complete!"
