-- Update ANPR references to SOS in database
-- Rename anpr_detections table to sos_detections
ALTER TABLE IF EXISTS anpr_detections RENAME TO sos_detections;

-- Update any organization names that contain ANPR to SOS
UPDATE organizations 
SET organization_name = REPLACE(organization_name, 'ANPR', 'SOS')
WHERE organization_name ILIKE '%ANPR%';

-- Update any organization names that contain ADDA to SOS  
UPDATE organizations
SET organization_name = REPLACE(organization_name, 'ADDA', 'SOS')
WHERE organization_name ILIKE '%ADDA%';

-- Update index names
DROP INDEX IF EXISTS idx_anpr_detections_camera_id;
DROP INDEX IF EXISTS idx_anpr_detections_timestamp;

CREATE INDEX IF NOT EXISTS idx_sos_detections_camera_id ON sos_detections(camera_id);
CREATE INDEX IF NOT EXISTS idx_sos_detections_timestamp ON sos_detections(timestamp);