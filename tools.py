import json
import os
import hashlib
from typing import List, Dict, Any, Optional
from sqlalchemy import create_engine, text
from fpdf import FPDF
from datetime import datetime
import pandas as pd
from twilio.rest import Client
from channels import get_channel_config

class ToolExecutor:
    """
    The bridge between LLM linguistic intent and the Neon deterministic spine.
    """
    def __init__(self, engine):
        self.engine = engine
        # Load tool definitions from the spec
        spec_path = os.path.join(os.path.dirname(__file__), 'entrestate_codex_spec_v1.json')
        with open(spec_path, 'r') as f:
            spec = json.load(f)
            # Gemini expects bare function declarations, not OpenAI-style wrappers.
            self.tool_definitions = [tool['function'] for tool in spec['tools']['definitions']]

    def get_tool_definitions(self):
        return self.tool_definitions

    def _get_property_snapshot(self, name: str) -> Optional[Dict[str, Any]]:
        if not name:
            return None
        with self.engine.connect() as conn:
            row = conn.execute(
                text("SELECT * FROM agent_inventory_view_v1 WHERE name ILIKE :name LIMIT 1"),
                {"name": f"%{name}%"},
            ).fetchone()
            return dict(row._mapping) if row else None

    def execute(self, name: str, args: dict, session_id: str = None, user_id: str = "default") -> dict:
        """Routes the tool call to the correct internal method."""
        method = getattr(self, f"tool_{name}", None)
        if method:
            try:
                return method(args, session_id, user_id=user_id)
            except TypeError:
                # Older tool methods don't accept user_id — call without it
                try:
                    return method(args, session_id)
                except Exception as e:
                    return {"error": str(e)}
            except Exception as e:
                return {"error": str(e)}
        return {"error": f"Tool {name} is not implemented."}

    # ── TOOL IMPLEMENTATIONS ──────────────────────────────────────

    def tool_search_properties(self, args: dict, session_id: str):
        """Calls the ranked routing function in Neon."""
        with self.engine.connect() as conn:
            query = text("""
                SELECT * FROM agent_ranked_for_investor_v1(
                    :risk_profile, :horizon, :budget_aed, :preferred_area, :beds_pref, :intent, :limit
                )
            """)
            result = conn.execute(query, {
                "risk_profile": args.get("risk_profile"),
                "horizon": args.get("horizon"),
                "budget_aed": args.get("budget_aed", 0),
                "preferred_area": args.get("preferred_area"),
                "beds_pref": args.get("beds_pref"),
                "intent": args.get("intent", "invest"),
                "limit": args.get("limit", 10)
            })
            return [dict(row._mapping) for row in result]

    def tool_get_area_intelligence(self, args: dict, session_id: str):
        """Retrieves the pre-computed Area Intelligence Card + DLD Benchmarks."""
        with self.engine.connect() as conn:
            # Get Area Card
            query = text("SELECT * FROM entrestate_area_cards WHERE area ILIKE :area")
            row = conn.execute(query, {"area": f"%{args.get('area')}%"}).fetchone()
            
            # Get DLD Benchmarks
            dld_query = text("SELECT * FROM dld_area_benchmarks WHERE area_name_clean ILIKE :area")
            dld_row = conn.execute(dld_query, {"area": f"%{args.get('area')}%"}).fetchone()
            
            if not row and not dld_row:
                return {"error": "Area not found in intelligence database."}
            
            res = dict(row._mapping) if row else {}
            if dld_row:
                res['dld_benchmarks'] = dict(dld_row._mapping)
            return res

    def tool_update_investor_profile(self, args: dict, session_id: str):
        """Persists natural language preferences into the structured Neon profile."""
        if not session_id:
            return {"error": "No session ID provided for profile update."}
            
        # Filter out None values
        updates = {k: v for k, v in args.items() if v is not None}
        
        # Build dynamic SQL update
        set_clause = ", ".join([f"{k} = :{k}" for k in updates.keys()])
        query = text(f"""
            INSERT INTO investor_intent_profiles (session_id, {", ".join(updates.keys())})
            VALUES (:session_id, {", ".join([f":{k}" for k in updates.keys()])})
            ON CONFLICT (session_id) DO UPDATE SET {set_clause}, updated_at = NOW()
        """)
        
        with self.engine.connect() as conn:
            conn.execute(query, {"session_id": session_id, **updates})
            conn.commit()
            
        return {"status": "profile_updated", "fields": list(updates.keys())}

    def tool_get_market_overview(self, args: dict, session_id: str):
        """Returns the high-level market pulse for the landing page."""
        with self.engine.connect() as conn:
            row = conn.execute(text("SELECT * FROM get_market_overview()")).fetchone()
            return dict(row._mapping)

    def tool_calculate_mortgage(self, args: dict, session_id: str):
        """Calculates mortgage scenarios and affordability."""
        name = args.get('property_name')
        price = 0
        if name:
            with self.engine.connect() as conn:
                row = conn.execute(
                    text("SELECT price_aed FROM agent_inventory_view_v1 WHERE name ILIKE :name LIMIT 1"),
                    {"name": f"%{name}%"}
                ).fetchone()
                if row:
                    price = row[0] or 0
        
        if price == 0:
            price = args.get('property_value', 0)
            
        if price == 0:
            return {"error": "Property price not found. Please specify a property name or value."}

        down_pct = args.get('down_payment_pct', 20) / 100
        rate = args.get('rate_pct', 4.5) / 100 / 12
        term = args.get('term_years', 25) * 12
        
        loan = price * (1 - down_pct)
        monthly = loan * (rate / (1 - (1 + rate) ** (-term))) if rate > 0 else loan / term
        
        monthly_income = args.get('monthly_income')
        
        result = {
            "property_name": name,
            "monthly_payment": round(monthly),
            "loan_amount": round(loan),
            "total_interest": round((monthly * term) - loan),
            "down_payment": round(price * down_pct),
            "rate_pct": args.get('rate_pct', 4.5),
            "term_years": args.get('term_years', 25)
        }
        
        if monthly_income:
            dti = (monthly / monthly_income * 100)
            score = max(0, min(100, 100 - (dti * 2))) # 0% DTI = 100, 50% DTI = 0
            result["affordability"] = {
                "score": round(score),
                "dti_pct": round(dti, 1),
                "verdict": "AFFORDABLE" if dti < 35 else "STRETCHED" if dti < 50 else "UNAFFORDABLE"
            }
            
        return result

    def tool_analyze_investment(self, args: dict, session_id: str):
        """Performs a 5-10 year ROI projection."""
        # Logic pulled from your Market ROI Engine
        name = args.get('property_name')
        years = args.get('holding_years', 5)
        
        with self.engine.connect() as conn:
            row = conn.execute(
                text("SELECT * FROM agent_inventory_view_v1 WHERE name ILIKE :name LIMIT 1"),
                {"name": f"%{name}%"}
            ).fetchone()
            
        if not row:
            return {"error": "Property not found"}
            
        p = dict(row._mapping)
        price = p.get('price_aed', 0)
        yield_pct = p.get('gross_yield', 0) / 100
        appreciation = 0.05 # Standard Dubai benchmark
        
        future_val = price * ((1 + appreciation) ** years)
        total_rent = (price * yield_pct) * years
        roi_pct = ((future_val + total_rent - price) / price) * 100
        
        return {
            "future_value": round(future_val),
            "total_rental_income": round(total_rent),
            "total_roi_pct": round(roi_pct, 1),
            "annualized_return": round(roi_pct / years, 1)
        }

    def tool_generate_document_pdf(self, args: dict, session_id: str):
        """Generates a branded PDF brief."""
        doc_type = args.get('document_type', 'offer')
        prop_name = args.get('property_name')
        
        # Fetch data for the PDF
        if prop_name and doc_type == 'investment_analysis':
            data = self.execute("analyze_investment", {"property_name": prop_name}, session_id)
        elif prop_name:
            data = self._get_property_snapshot(prop_name) or {"error": "Property not found."}
        else:
            data = self.tool_get_market_pulse({}, session_id)
            prop_name = "Dubai Market Overview"
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(0, 10, f"LELWA | {doc_type.upper()} REPORT", ln=True, align='C')
        pdf.ln(10)
        
        pdf.set_font("Helvetica", "", 12)
        pdf.cell(0, 10, f"Property: {prop_name}", ln=True)
        pdf.cell(0, 10, f"Generated: {datetime.now().strftime('%Y-%m-%d')}", ln=True)
        pdf.ln(5)
        
        # Add data rows
        if isinstance(data, list):
            data = data[0] if data else {}
        if isinstance(data, dict):
            for k, v in data.items():
                pdf.cell(0, 8, f"{k.replace('_', ' ').title()}: {v}", ln=True)
        
        pdf.set_y(-30)
        pdf.set_font("Helvetica", "I", 8)
        pdf.multi_cell(0, 5, "Disclaimer: This document is prepared by Lelwa. Figures are based on DLD data and are not guaranteed.")
        
        filename = f"lelwa_{doc_type}_{hash(prop_name)}.pdf"
        filepath = f"static/pdfs/{filename}"
        os.makedirs("static/pdfs", exist_ok=True)
        pdf.output(filepath)
        
        return {"pdf_url": f"https://api.ezz.ae/static/pdfs/{filename}", "status": "generated"}

    def tool_generate_offer(self, args: dict, session_id: str):
        """Generates a branded property offer PDF."""
        return self.tool_generate_document_pdf({
            "document_type": "offer",
            "property_name": args.get("property_name"),
            "budget_aed": args.get("buyer_budget"),
            "intent": args.get("intent")
        }, session_id)

    def tool_generate_property_visual(self, args: dict, session_id: str):
        """Generates a Canva-style HTML property card."""
        return {"error": "The 'generate_property_visual' tool is not yet implemented."}

    def tool_generate_viewing_plan(self, args: dict, session_id: str):
        """Generates a viewing plan for visiting properties."""
        property_names = args.get("property_names", "").split(",")
        
        plan = {
            "properties_to_visit": property_names,
            "general_questions": [
                "What is the service charge history?",
                "Are there any upcoming community-wide maintenance projects?",
                "What is the current owner's motivation for selling?",
                "Has the property been vacant for long?"
            ],
            "red_flags_to_check": [
                "Signs of water damage on ceilings or walls.",
                "Cracks in the foundation or walls.",
                "Outdated electrical panel.",
                "Poor water pressure."
            ],
            "property_specific_checklist": {}
        }
        
        for prop in property_names:
            plan["property_specific_checklist"][prop.strip()] = [
                "Check the age and condition of the AC unit.",
                "Verify the developer's reputation for quality.",
                "Assess the level of natural light during the day."
            ]
            
        return plan

    def tool_plan_investment_portfolio(self, args: dict, session_id: str):
        """Splits a budget across multiple properties for an optimal portfolio."""
        total_budget = args.get("total_budget")
        risk_profile = args.get("risk_profile")
        num_properties = args.get("num_properties", 3)
        intent = args.get("intent")

        if not total_budget or not risk_profile:
            return {"error": "Total budget and risk profile are required."}

        # Naive budget split
        budget_per_property = total_budget / num_properties
        
        portfolio = []
        for i in range(num_properties):
            search_args = {
                "risk_profile": risk_profile,
                "horizon": "1-2yr", # Assume a mid-term horizon for portfolio planning
                "budget_aed": budget_per_property,
                "intent": intent,
                "limit": 1
            }
            properties = self.tool_search_properties(search_args, session_id)
            if properties:
                portfolio.append(properties[0])

        return {
            "status": "portfolio_generated",
            "properties": portfolio,
            "summary": f"Generated a portfolio of {len(portfolio)} properties for a budget of {total_budget}."
        }

    def tool_generate_negotiation_plan(self, args: dict, session_id: str):
        """Generates a branded negotiation plan PDF."""
        return self.tool_generate_document_pdf({
            "document_type": "negotiation",
            "property_name": args.get("property_name")
        }, session_id)

    def tool_generate_rental_contract(self, args: dict, session_id: str):
        """Generates a branded rental contract PDF."""
        return self.tool_generate_document_pdf({
            "document_type": "rental_contract",
            "property_name": args.get("property_name"),
            "annual_rent": args.get("annual_rent_aed")
        }, session_id)

    def tool_qualify_lead(self, args: dict, session_id: str):
        """Scores lead readiness based on BANT-style inputs."""
        score = 0
        if args.get('budget_confirmed'): score += 25
        if args.get('financing_status') == 'cash': score += 25
        if args.get('timeline') == 'immediate': score += 25
        if args.get('decision_maker'): score += 25
        
        stage = 'HOT' if score >= 75 else 'WARM' if score >= 50 else 'NURTURE'
        return {"score": score, "stage": stage, "recommendation": "Schedule viewing" if stage == 'HOT' else "Send market report"}

    def tool_get_project_price_reality(self, args: dict, session_id: str):
        """Fetches latest DLD transactions for a project to show Price Reality."""
        name = args.get('property_name')
        with self.engine.connect() as conn:
            # Get project listing info from inventory
            proj_query = text("""
                SELECT name, area, final_price_from, final_price_per_sqft 
                FROM entrestate_inventory 
                WHERE name ILIKE :name LIMIT 1
            """)
            proj = conn.execute(proj_query, {"name": f"%{name}%"}).fetchone()
            
            if not proj:
                return {"error": "Project not found"}
            
            # Get DLD transactions for this project from the sales table
            tx_query = text("""
                SELECT actual_worth as transaction_value, meter_sale_price * 0.0929 as price_per_sqft, 
                       instance_date as registration_date, 
                       CASE WHEN trans_group_en ILIKE '%off%' THEN true ELSE false END as is_offplan
                FROM dld_sales_transactions
                WHERE project_name_en ILIKE :name
                ORDER BY instance_date DESC
                LIMIT 5
            """)
            txs = conn.execute(tx_query, {"name": f"%{name}%"}).fetchall()
            
            # Get area benchmarks for context
            area_query = text("""
                SELECT median_price, median_psf, tx_count
                FROM dld_area_benchmarks
                WHERE area_name_clean ILIKE :area
            """)
            area_bench = conn.execute(area_query, {"area": f"%{proj.area}%"}).fetchone()

            return {
                "project_name": proj.name,
                "listing_price": proj.final_price_from,
                "listing_psf": proj.final_price_per_sqft,
                "recent_transactions": [dict(t._mapping) for t in txs],
                "area_benchmark": dict(area_bench._mapping) if area_bench else None,
                "price_reality_signal": "UNDERPRICED" if proj.final_price_from < (area_bench.median_price if area_bench else 0) else "PREMIUM"
            }

    def tool_get_interior_design_advisory(self, args: dict, session_id: str):
        """Generates interior design advisory with cost estimates and layout tips."""
        style = args.get("style", "contemporary")
        size = args.get("size_sqft", 1000)
        purpose = args.get("purpose", "live")
        
        styles = {
            "modern_minimal": {"cost_psf": 45, "desc": "Clean lines, neutral palette."},
            "luxury_arabic": {"cost_psf": 85, "desc": "Marble, brass, and rich textures."},
            "scandinavian": {"cost_psf": 55, "desc": "Light wood, functional, cozy."},
            "contemporary": {"cost_psf": 60, "desc": "Balanced, modern, versatile."}
        }
        
        info = styles.get(style, styles["contemporary"])
        base_cost = size * info['cost_psf']
        
        tips = [
            "Focus on lighting: recessed LEDs add immediate value.",
            "Built-in storage is the #1 request for Dubai tenants."
        ]
        if args.get("off_plan"):
            tips.append("Request developer's customization menu NOW to save 30% on post-handover changes.")
            
        return {
            "style_profile": info["desc"],
            "estimated_cost_aed": round(base_cost),
            "cost_range": f"AED {int(base_cost*0.8):,} - {int(base_cost*1.2):,}",
            "investment_approach": "Neutral palette for maximum rental appeal" if purpose == "invest" else "Personalized comfort",
            "layout_tips": tips,
            "timeline": "4-8 weeks for design + 6-12 weeks for execution"
        }

    def tool_explore_tokenized_assets(self, args: dict, session_id: str):
        """Lists fractional ownership opportunities from Mashroi."""
        vara_only = args.get('vara_compliant', False)
        
        query_str = """
            SELECT token_id, property_name, area, token_price_aed, annual_yield_pct, min_tokens, regulatory_status
            FROM mashroi_tokenized_assets 
            WHERE annual_yield_pct >= :min_yield 
            AND token_price_aed <= :max_budget
            AND sold_tokens < token_count
        """
        
        if vara_only:
            query_str += " AND regulatory_status = 'VARA_APPROVED'"

        with self.engine.connect() as conn:
            result = conn.execute(text(query_str), {
                "min_yield": args.get("min_yield", 0),
                "max_budget": args.get("max_budget_aed", 10000000)
            }).fetchall()
            return [dict(row._mapping) for row in result]

    def tool_update_token_status(self, args: dict, session_id: str):
        """Updates the regulatory status of a tokenized asset."""
        token_id = args.get('token_id')
        status = args.get('status')
        
        if not token_id or not status:
            return {"error": "Missing token_id or status"}
            
        query = text("""
            UPDATE mashroi_tokenized_assets 
            SET regulatory_status = :status
            WHERE token_id = :token_id
        """)
        
        with self.engine.connect() as conn:
            result = conn.execute(query, {"token_id": token_id, "status": status})
            conn.commit()
            
        if result.rowcount == 0:
            return {"error": "Tokenized asset not found"}
            
        return {"status": "success", "token_id": token_id, "new_status": status}

    def tool_explain_location(self, args: dict, session_id: str):
        """
        Provides progressive location intelligence for a Dubai area.
        Includes vibe, landmarks, schools, and 3D visual links.
        """
        area_name = args.get("area_name", "")
        depth = args.get("depth", "detailed")
        
        # Area intelligence data from spec
        DUBAI_AREAS = {
            "Dubai Marina": {"lat": 25.0805, "lng": 55.1403, "vibe": "expat hub, walkable, nightlife, beach access", "landmarks": ["Marina Mall", "JBR Beach", "The Walk"], "schools_nearby": ["GEMS Wellington Academy", "Marina Preschool"], "metro": "DMCC/JLT stations"},
            "Downtown Dubai": {"lat": 25.1972, "lng": 55.2744, "vibe": "iconic, tourist magnet, premium pricing", "landmarks": ["Burj Khalifa", "Dubai Mall", "Opera"], "schools_nearby": ["GEMS Wellington Primary"], "metro": "Burj Khalifa station"},
            "Business Bay": {"lat": 25.1860, "lng": 55.2645, "vibe": "new downtown, canal views, value play vs Downtown", "landmarks": ["Dubai Canal", "Bay Avenue", "Marasi Drive"], "schools_nearby": ["JSS International"], "metro": "Business Bay station"},
            "Jumeirah Village Circle": {"lat": 25.0653, "lng": 55.2110, "vibe": "family value, fast-growing, affordable", "landmarks": ["Circle Mall", "JVC Community Park"], "schools_nearby": ["JSS International", "GEMS Metropole"], "metro": "15 min to nearest"},
            "Palm Jumeirah": {"lat": 25.1124, "lng": 55.1390, "vibe": "ultra-luxury, beachfront, resort living", "landmarks": ["Atlantis", "The Pointe", "Nakheel Mall"], "schools_nearby": ["Kings School"], "metro": "Palm Monorail"},
        }
        
        area = DUBAI_AREAS.get(area_name)
        if not area:
            # Fuzzy match fallback
            close = [a for a in DUBAI_AREAS if area_name.lower() in a.lower()]
            if close:
                area_name = close[0]
                area = DUBAI_AREAS[area_name]
            else:
                return {"error": f"Area '{area_name}' not found in visual database."}

        lat, lng = area['lat'], area['lng']
        
        result = {
            "area": area_name,
            "vibe": area['vibe'],
            "map_url": f"https://www.google.com/maps/@{lat},{lng},15z",
            "street_view_url": f"https://maps.google.com/maps?q=&layer=c&cbll={lat},{lng}&cbp=11,0,0,0,0&output=embed",
            "google_earth_3d_url": f"https://earth.google.com/web/@{lat},{lng},50a,800d,35y,0h,60t,0r",
            "coordinates": {"lat": lat, "lng": lng}
        }

        if depth in ["detailed", "deep"]:
            result.update({"landmarks": area['landmarks'], "schools": area['schools_nearby'], "metro": area['metro']})
            
        return result
    def tool_get_market_regime(self, args: dict, session_id: str):
        """
        Synthesizes 6 signals into a business direction.
        Logic: Transaction Velocity + Launch Rate + Demand + Construction + Handover + Season.
        """
        try:
            with self.engine.connect() as conn:
                # Aggregate signals from the Neon spine
                stats = conn.execute(text("""
                    SELECT 
                        (SELECT COUNT(*) FROM dld_sales_transactions WHERE instance_date > NOW() - INTERVAL '30 days') as monthly_tx,
                        (SELECT COUNT(*) FROM entrestate_inventory WHERE launch_year >= 2025) as recent_launches,
                        (SELECT AVG(rental_demand_score) FROM entrestate_inventory) as avg_demand,
                        (SELECT COUNT(*) FROM entrestate_inventory WHERE final_status = 'Under Construction') as construction_count,
                        (SELECT COUNT(*) FROM entrestate_inventory WHERE final_status = 'Handover Year (Critical)') as handover_wave,
                        (SELECT AVG(growth_score) FROM growth_by_area) as avg_growth
                    FROM entrestate_inventory LIMIT 1
                """)).fetchone()

                s = dict(stats._mapping)

            # Deterministic Regime Logic
            is_bull = s['monthly_tx'] > 500 and s['avg_growth'] > 50
            is_oversupplied = s['construction_count'] > 2000

            regime = "BULL" if is_bull else "TRANSITIONAL"
            if is_oversupplied:
                regime = "OVERSUPPLIED"

            return {
                "regime": regime,
                "signals": {
                    "transaction_velocity": "HIGH" if s['monthly_tx'] > 500 else "NORMAL",
                    "launch_rate": "ACCELERATED" if s['recent_launches'] > 50 else "STABLE",
                    "demand_intensity": round(s['avg_demand'], 1) if s['avg_demand'] else 50.0,
                    "construction_rate": s['construction_count'],
                    "handover_traffic": s['handover_wave'],
                    "seasonal_position": datetime.now().strftime('%B')
                },
                "directive": "ACCELERATE" if regime == "BULL" else "SELECTIVE_BUY",
                "recommendation": "Focus on Capital Safe assets in Hypergrowth areas."
            }
        except Exception:
            return {
                "regime": "TRANSITIONAL",
                "signals": {
                    "transaction_velocity": "NORMAL",
                    "launch_rate": "STABLE",
                    "demand_intensity": 50.0,
                    "construction_rate": 0,
                    "handover_traffic": 0,
                    "seasonal_position": datetime.now().strftime('%B')
                },
                "directive": "SELECTIVE_BUY",
                "recommendation": "Focus on Capital Safe assets in Hypergrowth areas."
            }

    # ── CHANNEL PREFLIGHT ─────────────────────────────────────────
    # Credentials are fetched from channels.db per request.
    # os.environ is never read or written for channel secrets.

    def _preflight_whatsapp(self, args: dict, user_id: str = "default") -> Optional[dict]:
        """Returns preflight object if WhatsApp credentials are missing in the DB."""
        config = get_channel_config(user_id, "whatsapp")
        if not config or not all([
            config.get("account_sid"),
            config.get("auth_token"),
            config.get("from_number"),
        ]):
            return {
                "requires_connection": True,
                "channel": "whatsapp",
                "prompt": "Which number should send messages?",
                "fields": [
                    {"key": "account_sid", "type": "text", "label": "Twilio Account SID"},
                    {"key": "auth_token", "type": "password", "label": "Twilio Auth Token"},
                    {"key": "from_number", "type": "tel", "label": "WhatsApp sender (e.g. whatsapp:+14155238886)"},
                ],
            }
        return None

    def _preflight_voice(self, args: dict, user_id: str = "default") -> Optional[dict]:
        """Returns preflight object if voice credentials are missing in the DB."""
        config = get_channel_config(user_id, "voice")
        if not config or not all([
            config.get("account_sid"),
            config.get("auth_token"),
            config.get("from_number"),
        ]):
            return {
                "requires_connection": True,
                "channel": "voice",
                "prompt": "Which number should place the call?",
                "fields": [
                    {"key": "account_sid", "type": "text", "label": "Twilio Account SID"},
                    {"key": "auth_token", "type": "password", "label": "Twilio Auth Token"},
                    {"key": "from_number", "type": "tel", "label": "Caller number (e.g. +971XXXXXXXXX)"},
                ],
            }
        return None

    def tool_send_whatsapp(self, args: dict, session_id: str, user_id: str = "default"):
        """Delivers messages via Twilio WhatsApp. Credentials loaded from channels.db."""
        preflight = self._preflight_whatsapp(args, user_id)
        if preflight:
            return preflight
        config = get_channel_config(user_id, "whatsapp")
        client = Client(config["account_sid"], config["auth_token"])
        to_number = args.get("to_number", "")
        msg_args = {
            "from_": config["from_number"],
            "to": f"whatsapp:{to_number}" if not to_number.startswith("whatsapp:") else to_number,
            "body": args.get(
                "message_body",
                f"Hi {args.get('investor_name', 'there')}, you have a message from your broker.",
            ),
        }
        media_url = args.get("media_url")
        if media_url:
            msg_args["media_url"] = [media_url]
        message = client.messages.create(**msg_args)
        return {"status": "sent", "sid": message.sid}

    def tool_call_investor(self, args: dict, session_id: str, user_id: str = "default"):
        """Places a voice call via Twilio TwiML. Credentials loaded from channels.db."""
        preflight = self._preflight_voice(args, user_id)
        if preflight:
            return preflight
        config = get_channel_config(user_id, "voice")
        client = Client(config["account_sid"], config["auth_token"])
        message = args.get(
            "message",
            f"Hi {args.get('investor_name', 'there')}, this is your broker with a property update.",
        )
        call = client.calls.create(
            twiml=f'<Response><Say voice="Polly.Joanna-Generative">{message}</Say></Response>',
            to=args.get("to_number"),
            from_=config["from_number"],
        )
        return {"status": "calling", "sid": call.sid}

    def tool_queue_remote_agent_job(self, args: dict, session_id: str):
        """Queues a remote agent job for a broker (e.g. updating listings on portals)."""
        broker_id = args.get('broker_id')
        target_platform = args.get('target_platform')
        job_id = f"JOB-{hashlib.md5(f'{broker_id}{datetime.now()}'.encode()).hexdigest()[:8].upper()}"
        
        query = text("""
            INSERT INTO lelwa_remote_agent_jobs (job_id, user_id, job_type, description, target_platform, actions, status)
            VALUES (:job_id, :user_id, :job_type, :description, :target_platform, :actions, 'queued')
        """)
        
        with self.engine.connect() as conn:
            conn.execute(query, {
                "job_id": job_id,
                "user_id": broker_id,
                "job_type": args.get('job_type', 'listing_update'),
                "description": args.get('description'),
                "target_platform": target_platform,
                "actions": json.dumps(args.get('actions', [])),
            })
            conn.commit()
            
        return {"status": "queued", "job_id": job_id}

    def tool_stress_test_investment(self, args: dict, session_id: str):
        """
        Models the impact of market shifts on a specific project.
        Scenarios: Interest rate hikes, market corrections, construction delays.
        """
        name = args.get('property_name')
        rate_hike = args.get('interest_rate_hike_pct', 2.0)
        correction = args.get('market_correction_pct', -15.0)
        delay = args.get('construction_delay_years', 1)

        with self.engine.connect() as conn:
            row = conn.execute(
                text("SELECT * FROM agent_inventory_view_v1 WHERE name ILIKE :name LIMIT 1"),
                {"name": f"%{name}%"}
            ).fetchone()
            
        if not row:
            return {"error": "Property not found"}
            
        p = dict(row._mapping)
        price = p.get('price_aed', 0)
        yield_pct = p.get('gross_yield', 0) / 100
        
        # Base Case (5yr)
        base_roi = self.tool_analyze_investment({"property_name": name, "holding_years": 5}, session_id)
        
        # Stress Case Calculation
        stress_appreciation = 0.05 + (correction / 100 / 5) - (rate_hike / 100 / 2)
        stress_future_val = price * ((1 + stress_appreciation) ** (5 + delay))
        stress_total_rent = (price * yield_pct) * 5 
        stress_roi_pct = ((stress_future_val + stress_total_rent - price) / price) * 100
        
        return {
            "property_name": p['name'],
            "base_case_5yr_roi": base_roi.get('total_roi_pct'),
            "stress_case_roi": round(stress_roi_pct, 1),
            "impact_analysis": {
                "equity_erosion": f"{abs(correction)}% from market correction",
                "financing_drag": f"Increased debt service from {rate_hike}% rate hike",
                "liquidity_lock": f"{delay} year delay in capital recycling"
            },
            "verdict": "RESILIENT" if stress_roi_pct > 15 else "VULNERABLE"
        }

    def tool_get_market_pulse(self, args: dict, session_id: str):
        """Aggregates Growth Intelligence for the dashboard."""
        regime_data = self.tool_get_market_regime({}, session_id)
        try:
            with self.engine.connect() as conn:
                try:
                    areas = conn.execute(text(
                        "SELECT area, growth_score, growth_class, avg_yield FROM growth_by_area "
                        "WHERE growth_class = 'HYPERGROWTH' LIMIT 5"
                    )).fetchall()
                except Exception:
                    areas = conn.execute(text(
                        "SELECT area, growth_score, growth_class, avg_yield FROM layer3_growth_by_area "
                        "WHERE growth_class = 'HYPERGROWTH' LIMIT 5"
                    )).fetchall()

                try:
                    cities = conn.execute(text(
                        "SELECT city, growth_score, growth_class, avg_yield FROM growth_by_city "
                        "ORDER BY growth_score DESC LIMIT 5"
                    )).fetchall()
                except Exception:
                    cities = conn.execute(text(
                        "SELECT city, growth_score, growth_class, avg_yield FROM layer3_growth_by_city "
                        "ORDER BY growth_score DESC LIMIT 5"
                    )).fetchall()

                efficiency = conn.execute(text(
                    "SELECT AVG(inferred_value) FROM layer4_market_inferences "
                    "WHERE inference_type = 'market_efficiency'"
                )).scalar()

                return {
                    "regime": regime_data.get("regime"),
                    "directive": regime_data.get("directive"),
                    "signals": regime_data.get("signals"),
                    "market_efficiency_score": round(efficiency, 1) if efficiency else 65.0,
                    "hypergrowth_areas": [dict(r._mapping) for r in areas],
                    "top_cities": [dict(r._mapping) for r in cities],
                    "timestamp": datetime.now().isoformat()
                }
        except Exception:
            return {
                "regime": regime_data.get("regime", "Balanced"),
                "directive": regime_data.get("directive", "MAINTAIN"),
                "signals": regime_data.get("signals", {}),
                "market_efficiency_score": 65.0,
                "hypergrowth_areas": [],
                "top_cities": [],
                "timestamp": datetime.now().isoformat()
            }

    def tool_compare_properties(self, args: dict, session_id: str):
        """Side-by-side comparison of 2-4 properties."""
        raw_names = args.get('property_names', '')
        if isinstance(raw_names, list):
            pnames = raw_names
        else:
            pnames = [n.strip() for n in raw_names.split(',') if n.strip()]
        
        results = []
        with self.engine.connect() as conn:
            for name in pnames[:4]:
                query = text("""
                    SELECT * FROM agent_inventory_view_v1
                    WHERE name ILIKE :name LIMIT 1
                """)
                row = conn.execute(query, {"name": f"%{name}%"}).fetchone()
                if row:
                    d = dict(row._mapping)
                    # Parse JSON strings
                    for k in ['reason_codes', 'risk_flags', 'drivers']:
                        if k in d and isinstance(d[k], str):
                            try: d[k] = json.loads(d[k])
                            except: pass
                    results.append(d)
                else:
                    results.append({"name": name, "error": "not found"})
        
        return {"type": "COMPARISON", "properties": results}
