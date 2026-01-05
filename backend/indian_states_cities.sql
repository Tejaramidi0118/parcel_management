-- Indian States and Cities Data
-- This script populates the state and city tables with Indian states and major cities

-- Insert Indian States
INSERT INTO state (name, code) VALUES
('Andhra Pradesh', 'AP'),
('Arunachal Pradesh', 'AR'),
('Assam', 'AS'),
('Bihar', 'BR'),
('Chhattisgarh', 'CG'),
('Goa', 'GA'),
('Gujarat', 'GJ'),
('Haryana', 'HR'),
('Himachal Pradesh', 'HP'),
('Jharkhand', 'JH'),
('Karnataka', 'KA'),
('Kerala', 'KL'),
('Madhya Pradesh', 'MP'),
('Maharashtra', 'MH'),
('Manipur', 'MN'),
('Meghalaya', 'ML'),
('Mizoram', 'MZ'),
('Nagaland', 'NL'),
('Odisha', 'OD'),
('Punjab', 'PB'),
('Rajasthan', 'RJ'),
('Sikkim', 'SK'),
('Tamil Nadu', 'TN'),
('Telangana', 'TG'),
('Tripura', 'TR'),
('Uttar Pradesh', 'UP'),
('Uttarakhand', 'UK'),
('West Bengal', 'WB'),
('Delhi', 'DL'),
('Jammu and Kashmir', 'JK'),
('Ladakh', 'LA'),
('Puducherry', 'PY')
ON CONFLICT (name) DO NOTHING;

-- Insert Major Cities (with state references)
-- Note: This assumes state_id will be set based on the state name
-- You may need to adjust the state_id values based on your actual state table

-- Andhra Pradesh Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Visakhapatnam', state_id, 17.6868, 83.2185 FROM state WHERE name = 'Andhra Pradesh'
UNION ALL SELECT 'Vijayawada', state_id, 16.5062, 80.6480 FROM state WHERE name = 'Andhra Pradesh'
UNION ALL SELECT 'Guntur', state_id, 16.3067, 80.4365 FROM state WHERE name = 'Andhra Pradesh'
UNION ALL SELECT 'Nellore', state_id, 14.4426, 79.9864 FROM state WHERE name = 'Andhra Pradesh'
UNION ALL SELECT 'Kurnool', state_id, 15.8281, 78.0373 FROM state WHERE name = 'Andhra Pradesh'
ON CONFLICT DO NOTHING;

-- Maharashtra Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Mumbai', state_id, 19.0760, 72.8777 FROM state WHERE name = 'Maharashtra'
UNION ALL SELECT 'Pune', state_id, 18.5204, 73.8567 FROM state WHERE name = 'Maharashtra'
UNION ALL SELECT 'Nagpur', state_id, 21.1458, 79.0882 FROM state WHERE name = 'Maharashtra'
UNION ALL SELECT 'Nashik', state_id, 19.9975, 73.7898 FROM state WHERE name = 'Maharashtra'
UNION ALL SELECT 'Aurangabad', state_id, 19.8762, 75.3433 FROM state WHERE name = 'Maharashtra'
ON CONFLICT DO NOTHING;

-- Karnataka Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Bangalore', state_id, 12.9716, 77.5946 FROM state WHERE name = 'Karnataka'
UNION ALL SELECT 'Mysore', state_id, 12.2958, 76.6394 FROM state WHERE name = 'Karnataka'
UNION ALL SELECT 'Hubli', state_id, 15.3647, 75.1240 FROM state WHERE name = 'Karnataka'
UNION ALL SELECT 'Mangalore', state_id, 12.9141, 74.8560 FROM state WHERE name = 'Karnataka'
UNION ALL SELECT 'Belagavi', state_id, 15.8497, 74.4977 FROM state WHERE name = 'Karnataka'
ON CONFLICT DO NOTHING;

-- Tamil Nadu Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Chennai', state_id, 13.0827, 80.2707 FROM state WHERE name = 'Tamil Nadu'
UNION ALL SELECT 'Coimbatore', state_id, 11.0168, 76.9558 FROM state WHERE name = 'Tamil Nadu'
UNION ALL SELECT 'Madurai', state_id, 9.9252, 78.1198 FROM state WHERE name = 'Tamil Nadu'
UNION ALL SELECT 'Tiruchirappalli', state_id, 10.7905, 78.7047 FROM state WHERE name = 'Tamil Nadu'
UNION ALL SELECT 'Salem', state_id, 11.6643, 78.1460 FROM state WHERE name = 'Tamil Nadu'
ON CONFLICT DO NOTHING;

-- Telangana Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Hyderabad', state_id, 17.3850, 78.4867 FROM state WHERE name = 'Telangana'
UNION ALL SELECT 'Warangal', state_id, 18.0000, 79.5833 FROM state WHERE name = 'Telangana'
UNION ALL SELECT 'Nizamabad', state_id, 18.6715, 78.0948 FROM state WHERE name = 'Telangana'
UNION ALL SELECT 'Karimnagar', state_id, 18.4386, 79.1288 FROM state WHERE name = 'Telangana'
ON CONFLICT DO NOTHING;

-- Gujarat Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Ahmedabad', state_id, 23.0225, 72.5714 FROM state WHERE name = 'Gujarat'
UNION ALL SELECT 'Surat', state_id, 21.1702, 72.8311 FROM state WHERE name = 'Gujarat'
UNION ALL SELECT 'Vadodara', state_id, 22.3072, 73.1812 FROM state WHERE name = 'Gujarat'
UNION ALL SELECT 'Rajkot', state_id, 22.3039, 70.8022 FROM state WHERE name = 'Gujarat'
UNION ALL SELECT 'Bhavnagar', state_id, 21.7645, 72.1519 FROM state WHERE name = 'Gujarat'
ON CONFLICT DO NOTHING;

-- West Bengal Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Kolkata', state_id, 22.5726, 88.3639 FROM state WHERE name = 'West Bengal'
UNION ALL SELECT 'Howrah', state_id, 22.5958, 88.2636 FROM state WHERE name = 'West Bengal'
UNION ALL SELECT 'Durgapur', state_id, 23.5204, 87.3119 FROM state WHERE name = 'West Bengal'
UNION ALL SELECT 'Asansol', state_id, 23.6739, 86.9524 FROM state WHERE name = 'West Bengal'
ON CONFLICT DO NOTHING;

-- Uttar Pradesh Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Lucknow', state_id, 26.8467, 80.9462 FROM state WHERE name = 'Uttar Pradesh'
UNION ALL SELECT 'Kanpur', state_id, 26.4499, 80.3319 FROM state WHERE name = 'Uttar Pradesh'
UNION ALL SELECT 'Agra', state_id, 27.1767, 78.0081 FROM state WHERE name = 'Uttar Pradesh'
UNION ALL SELECT 'Varanasi', state_id, 25.3176, 82.9739 FROM state WHERE name = 'Uttar Pradesh'
UNION ALL SELECT 'Allahabad', state_id, 25.4358, 81.8463 FROM state WHERE name = 'Uttar Pradesh'
ON CONFLICT DO NOTHING;

-- Delhi
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Delhi', state_id, 28.6139, 77.2090 FROM state WHERE name = 'Delhi'
ON CONFLICT DO NOTHING;

-- Rajasthan Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Jaipur', state_id, 26.9124, 75.7873 FROM state WHERE name = 'Rajasthan'
UNION ALL SELECT 'Jodhpur', state_id, 26.2389, 73.0243 FROM state WHERE name = 'Rajasthan'
UNION ALL SELECT 'Kota', state_id, 25.2138, 75.8648 FROM state WHERE name = 'Rajasthan'
UNION ALL SELECT 'Bikaner', state_id, 28.0229, 73.3119 FROM state WHERE name = 'Rajasthan'
UNION ALL SELECT 'Ajmer', state_id, 26.4499, 74.6399 FROM state WHERE name = 'Rajasthan'
ON CONFLICT DO NOTHING;

-- Punjab Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Ludhiana', state_id, 30.9010, 75.8573 FROM state WHERE name = 'Punjab'
UNION ALL SELECT 'Amritsar', state_id, 31.6340, 74.8723 FROM state WHERE name = 'Punjab'
UNION ALL SELECT 'Jalandhar', state_id, 31.3260, 75.5762 FROM state WHERE name = 'Punjab'
UNION ALL SELECT 'Patiala', state_id, 30.3398, 76.3869 FROM state WHERE name = 'Punjab'
ON CONFLICT DO NOTHING;

-- Haryana Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Gurgaon', state_id, 28.4089, 77.0378 FROM state WHERE name = 'Haryana'
UNION ALL SELECT 'Faridabad', state_id, 28.4089, 77.3178 FROM state WHERE name = 'Haryana'
UNION ALL SELECT 'Panipat', state_id, 29.3909, 76.9635 FROM state WHERE name = 'Haryana'
UNION ALL SELECT 'Ambala', state_id, 30.3782, 76.7767 FROM state WHERE name = 'Haryana'
ON CONFLICT DO NOTHING;

-- Kerala Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Kochi', state_id, 9.9312, 76.2673 FROM state WHERE name = 'Kerala'
UNION ALL SELECT 'Thiruvananthapuram', state_id, 8.5241, 76.9366 FROM state WHERE name = 'Kerala'
UNION ALL SELECT 'Kozhikode', state_id, 11.2588, 75.7804 FROM state WHERE name = 'Kerala'
UNION ALL SELECT 'Thrissur', state_id, 10.5276, 76.2144 FROM state WHERE name = 'Kerala'
ON CONFLICT DO NOTHING;

-- Madhya Pradesh Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Indore', state_id, 22.7196, 75.8577 FROM state WHERE name = 'Madhya Pradesh'
UNION ALL SELECT 'Bhopal', state_id, 23.2599, 77.4126 FROM state WHERE name = 'Madhya Pradesh'
UNION ALL SELECT 'Gwalior', state_id, 26.2183, 78.1828 FROM state WHERE name = 'Madhya Pradesh'
UNION ALL SELECT 'Jabalpur', state_id, 23.1815, 79.9864 FROM state WHERE name = 'Madhya Pradesh'
ON CONFLICT DO NOTHING;

-- Odisha Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Bhubaneswar', state_id, 20.2961, 85.8245 FROM state WHERE name = 'Odisha'
UNION ALL SELECT 'Cuttack', state_id, 20.4625, 85.8830 FROM state WHERE name = 'Odisha'
UNION ALL SELECT 'Rourkela', state_id, 22.2604, 84.8536 FROM state WHERE name = 'Odisha'
ON CONFLICT DO NOTHING;

-- Bihar Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Patna', state_id, 25.5941, 85.1376 FROM state WHERE name = 'Bihar'
UNION ALL SELECT 'Gaya', state_id, 24.7955, 84.9994 FROM state WHERE name = 'Bihar'
UNION ALL SELECT 'Bhagalpur', state_id, 25.2445, 86.9718 FROM state WHERE name = 'Bihar'
ON CONFLICT DO NOTHING;

-- Jharkhand Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Ranchi', state_id, 23.3441, 85.3096 FROM state WHERE name = 'Jharkhand'
UNION ALL SELECT 'Jamshedpur', state_id, 22.8046, 86.2029 FROM state WHERE name = 'Jharkhand'
UNION ALL SELECT 'Dhanbad', state_id, 23.7957, 86.4304 FROM state WHERE name = 'Jharkhand'
ON CONFLICT DO NOTHING;

-- Chhattisgarh Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Raipur', state_id, 21.2514, 81.6296 FROM state WHERE name = 'Chhattisgarh'
UNION ALL SELECT 'Bhilai', state_id, 21.2092, 81.4285 FROM state WHERE name = 'Chhattisgarh'
ON CONFLICT DO NOTHING;

-- Assam Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Guwahati', state_id, 26.1445, 91.7362 FROM state WHERE name = 'Assam'
UNION ALL SELECT 'Silchar', state_id, 24.8333, 92.7789 FROM state WHERE name = 'Assam'
ON CONFLICT DO NOTHING;

-- Uttarakhand Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Dehradun', state_id, 30.3165, 78.0322 FROM state WHERE name = 'Uttarakhand'
UNION ALL SELECT 'Haridwar', state_id, 29.9457, 78.1642 FROM state WHERE name = 'Uttarakhand'
ON CONFLICT DO NOTHING;

-- Himachal Pradesh Cities
INSERT INTO city (name, state_id, latitude, longitude)
SELECT 'Shimla', state_id, 31.1048, 77.1734 FROM state WHERE name = 'Himachal Pradesh'
UNION ALL SELECT 'Dharamshala', state_id, 32.2190, 76.3234 FROM state WHERE name = 'Himachal Pradesh'
ON CONFLICT DO NOTHING;

-- Note: This script uses ON CONFLICT DO NOTHING to avoid errors if data already exists
-- You may need to run this after your initial schema setup

