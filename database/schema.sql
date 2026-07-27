CREATE DATABASE IF NOT EXISTS cybershakti;
USE cybershakti;

CREATE TABLE IF NOT EXISTS scam_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  latitude DOUBLE NOT NULL,
  longitude DOUBLE NOT NULL,
  location_point POINT NOT NULL,
  status ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'verified',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  SPATIAL INDEX idx_location_point (location_point)
) ENGINE=InnoDB;

-- Auto-populates POINT column whenever latitude/longitude updates
DELIMITER $$
CREATE TRIGGER before_insert_scam_reports
BEFORE INSERT ON scam_reports
FOR EACH ROW
BEGIN
  SET NEW.location_point = POINT(NEW.longitude, NEW.latitude);
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER before_update_scam_reports
BEFORE UPDATE ON scam_reports
FOR EACH ROW
BEGIN
  SET NEW.location_point = POINT(NEW.longitude, NEW.latitude);
END$$
DELIMITER ;

-- Distance Procedure (Haversine Formula)
DELIMITER $$
CREATE PROCEDURE GetNearbyScams(
  IN user_lat DOUBLE,
  IN user_lon DOUBLE,
  IN radius_km DOUBLE
)
BEGIN
  SELECT 
    id, title, description, latitude, longitude, status, created_at,
    (
      6371 * ACOS(
        COS(RADIANS(user_lat)) * 
        COS(RADIANS(latitude)) * 
        COS(RADIANS(longitude - user_lon)) + 
        SIN(RADIANS(user_lat)) * 
        SIN(RADIANS(latitude))
      )
    ) AS distance
  FROM scam_reports
  WHERE status = 'verified'
  HAVING distance <= radius_km
  ORDER BY distance ASC;
END$$
DELIMITER ;
