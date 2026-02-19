import hashlib
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from pydantic import BaseModel

class RequestSignature(BaseModel):
    session_id: str
    timestamp: datetime
    intent: str
    params: Dict[str, Any]
    ip_hash: str
    result_count: int = 0

class ThreatAssessment(BaseModel):
    threat_level: str  # 'clear', 'elevated', 'high', 'critical'
    threat_score: float
    degradation_applied: str
    flags: List[str]

class SecurityShield:
    """
    Implements the 'Zero-Strategy' for data protection.
    Detects scrapers and bulk-extraction attempts.
    """
    def __init__(self):
        self.session_profiles = {}
        self.VOLUME_THRESHOLD_MINUTE = 15
        self.PRICE_KEYS = ['price', 'price_aed', 'final_price_from', 'gross_rental_yield', 'net_rental_yield']

    def evaluate_request(self, req: RequestSignature) -> ThreatAssessment:
        profile = self.session_profiles.setdefault(req.session_id, {
            'count': 0,
            'last_request': req.timestamp,
            'threat_score': 0,
            'flags': []
        })
        
        # 1. Simple Rate Limiting
        now = datetime.now()
        if (now - profile['last_request']).total_seconds() < 1:
            profile['threat_score'] += 10
            profile['flags'].append("RAPID_FIRE_REQUEST")

        profile['count'] += 1
        profile['last_request'] = now

        # 2. Pattern Detection (e.g., export attempts)
        if any(k in str(req.params).lower() for k in ['all', 'export', 'csv', 'dump']):
            profile['threat_score'] += 40
            profile['flags'].append("EXPORT_ATTEMPT")

        # Determine Level
        score = profile['threat_score']
        if score >= 70:
            level = 'critical'
            degradation = 'BLACKOUT'
        elif score >= 45:
            level = 'high'
            degradation = 'ZEROED'
        elif score >= 20:
            level = 'elevated'
            degradation = 'ROUNDED'
        else:
            level = 'clear'
            degradation = 'NONE'

        return ThreatAssessment(
            threat_level=level,
            threat_score=score,
            degradation_applied=degradation,
            flags=profile['flags']
        )

    def degrade_response(self, data: Any, assessment: ThreatAssessment) -> Any:
        """
        Applies the Zero-Strategy: if you're a bot, the market is worth 0 AED.
        """
        if assessment.threat_level == 'clear':
            return data

        if isinstance(data, list):
            return [self._degrade_item(item, assessment) for item in data[:5]]
        return self._degrade_item(data, assessment)

    def _degrade_item(self, item: Any, assessment: ThreatAssessment) -> Any:
        if not isinstance(item, dict):
            return item
        
        item_copy = item.copy()
        
        if assessment.threat_level == 'critical':
            # Return empty shells
            return {k: (0 if isinstance(v, (int, float)) else "") for k, v in item_copy.items()}
        
        if assessment.threat_level == 'high':
            # Zero out all financial data
            for key in self.PRICE_KEYS:
                if key in item_copy:
                    item_copy[key] = 0
            # Redact sensitive info
            for key in ['developer_website', 'brochure_url']:
                if key in item_copy:
                    item_copy[key] = "[REDACTED]"
                    
        elif assessment.threat_level == 'elevated':
            # Round prices to nearest 100k
            for key in self.PRICE_KEYS:
                if key in item_copy and isinstance(item_copy[key], (int, float)):
                    if item_copy[key] > 1000:
                        item_copy[key] = round(item_copy[key] / 100000) * 100000
        
        # Add a security watermark
        item_copy['_shield_id'] = hashlib.md5(str(datetime.now()).encode()).hexdigest()[:8]
        return item_copy