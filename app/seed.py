import os
import json
import datetime
import random
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models import User, Recycler, Collector, Lot, Transaction, TraceabilityEvent, Price, ActivityLog, Notification, PickupRecord
from app.auth.security import get_password_hash
from app.config import settings

MATERIALS = ['PCB', 'Cables', 'LCD Panel', 'Li-ion Battery', 'Ferrous Metal', 'Aluminium', 'Copper Wire', 'Plastic Casing', 'Mixed E-Waste', 'Precious Metals']
LOCATIONS = ['Kanchipuram', 'Chennai', 'Madurai', 'Coimbatore', 'Trichy', 'Tirunelveli', 'Thoothukudi', 'Ranipet', 'Bengaluru', 'Hyderabad', 'Warangal', 'Pune', 'Mumbai', 'Kochi']
STATUSES = ['CREATED', 'AI_VERIFIED', 'MATCHED', 'REQUESTED', 'ACCEPTED', 'REJECTED', 'PICKUP_SCHEDULED', 'HANDED_OVER', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED']
TRACE_STEPS = ['LOT CREATED', 'PHOTO CAPTURED', 'AI MATERIAL VERIFIED', 'LOCATION RECORDED', 'VALUE ESTIMATED', 'RECYCLER MATCHED', 'REQUEST SENT', 'RECYCLER ACCEPTED', 'PICKUP', 'HANDOVER', 'RECYCLER CONFIRMATION', 'PAYMENT', 'COMPLETED']

def load_authorized_recyclers_data():
    json_path = os.path.join(os.path.dirname(__file__), 'data', 'authorized_recyclers.json')
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def seed_database(db: Session = None, force_reset: bool = False):
    close_at_end = False
    if db is None:
        db = SessionLocal()
        close_at_end = True

    try:
        if force_reset:
            # Drop and recreate all tables
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)
        else:
            Base.metadata.create_all(bind=engine)
            existing_users = db.query(User).count()
            if existing_users > 0:
                return {"status": "already_seeded", "user_count": existing_users}

        # 1. Admin User
        admin_user = User(
            id="usr-admin",
            username=settings.ADMIN_USERNAME,
            password_hash=get_password_hash(settings.ADMIN_PASSWORD),
            role="ADMIN",
            is_active=True
        )
        db.add(admin_user)

        # 2. Recycler Dataset Import (108 Authorized Recyclers from official dataset)
        raw_recyclers = load_authorized_recyclers_data()
        recycler_records = []
        default_pwd_hash = get_password_hash("Recycler@2026#Secure")

        for r_data in raw_recyclers:
            rec_id = r_data.get('id')
            user = User(
                id=f"usr-{rec_id.lower()}",
                username=rec_id,
                password_hash=default_pwd_hash,
                role="RECYCLER",
                is_active=True
            )
            db.add(user)

            created_date = datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(5, 60))
            if r_data.get('createdAt'):
                try:
                    created_date = datetime.datetime.strptime(r_data['createdAt'], "%Y-%m-%d")
                except:
                    pass

            recycler = Recycler(
                id=rec_id,
                user_id=user.id,
                name=r_data.get('name') or r_data.get('companyName') or 'Authorized Recycler',
                company_name=r_data.get('companyName'),
                facility_name=r_data.get('facilityName'),
                facility_address=r_data.get('facilityAddress'),
                district=r_data.get('district'),
                state=r_data.get('state'),
                pincode=r_data.get('pincode'),
                location=r_data.get('location') or 'Tamil Nadu',
                lat=r_data.get('lat', 13.0827),
                lng=r_data.get('lng', 80.2707),
                materials_accepted=r_data.get('materialsAccepted') or ['PCB', 'Cables', 'Mixed E-Waste'],
                eee_categories=r_data.get('eeeCategories') or ['IT Equipment'],
                auth_status=r_data.get('authStatus') or 'AUTHORIZED',
                auth_number=r_data.get('authNumber') or r_data.get('cpcbRegistrationId'),
                cpcb_registration_id=r_data.get('cpcbRegistrationId'),
                cpcb_registration_status=r_data.get('cpcbRegistrationStatus') or 'Authorized Recycler',
                registration_date=r_data.get('registrationDate'),
                registration_valid_until=r_data.get('registrationValidUntil'),
                spcb_name=r_data.get('spcbName'),
                verification_status=r_data.get('verificationStatus') or 'Verified',
                processing_capacity_mt_per_year=r_data.get('processingCapacityMtPerYear'),
                offered_rate=float(r_data.get('offeredRate', 150.0)),
                price_material=r_data.get('priceMaterial', 'Mixed E-Waste'),
                minimum_quantity_kg=float(r_data.get('minimumQuantityKg', 0.0)),
                pickup_charge=float(r_data.get('pickupCharge', 0.0)),
                pickup_available=r_data.get('pickupAvailable', True),
                service_area=r_data.get('serviceArea') or f"{r_data.get('location', 'Local')} radius",
                contact=r_data.get('contact') or r_data.get('officialPhone'),
                contact_person=r_data.get('contactPerson'),
                email=r_data.get('email') or r_data.get('officialEmail'),
                website=r_data.get('website'),
                match_score=r_data.get('matchScore', 75),
                verification_score=r_data.get('verificationScore', 75),
                data_confidence=r_data.get('dataConfidence', 0.85),
                source_name=r_data.get('sourceName'),
                source_url=r_data.get('sourceUrl'),
                account_status=r_data.get('accountStatus', 'ACTIVE'),
                created_at=created_date
            )
            db.add(recycler)
            recycler_records.append(recycler)

        db.flush()

        # 3. Collectors (22 Collectors)
        collector_records = []
        languages = ['Tamil', 'Hindi', 'English', 'Telugu']
        for i in range(22):
            col_id = f"COL-2026-{str(i + 1).zfill(6)}"
            col_loc = LOCATIONS[i % len(LOCATIONS)]
            collector = Collector(
                id=col_id,
                language=languages[i % len(languages)],
                location=col_loc,
                lat=9.45 + (i * 0.04),
                lng=77.3 + (i * 0.04),
                total_lots=5 + i * 2,
                total_transactions=3 + i * 2,
                total_earnings=float(2500 + i * 1400),
                status="ACTIVE" if i % 6 != 0 else "INACTIVE",
                last_activity=f"2026-09-{str(1 + (i % 13)).zfill(2)}"
            )
            db.add(collector)
            collector_records.append(collector)

        db.flush()

        # 4. Lots (60 Lots linked to authentic authorized recyclers)
        lot_records = []
        for i in range(60):
            lot_id = f"LOT-2026-{str(i + 1).zfill(6)}"
            mat = MATERIALS[i % len(MATERIALS)]
            status = STATUSES[i % len(STATUSES)]
            weight = round(2.5 + (i * 0.7) % 20, 1)
            rate = 140 + (i * 15) % 300
            est_val = round(weight * rate, 2)
            quoted = round(est_val * 0.95, 2)
            final_val = est_val if status == "COMPLETED" else None
            
            collector = collector_records[i % len(collector_records)]
            recycler = recycler_records[i % len(recycler_records)]

            lot = Lot(
                id=lot_id,
                collector_id=collector.id,
                recycler_id=recycler.id,
                material=mat,
                sub_category="Grade A" if i % 2 == 0 else "Sorted",
                description=f"{mat} recovered from decommissioned equipment, visually sorted on-site.",
                weight=weight,
                condition="Good" if i % 3 != 0 else "Fair",
                ai_confidence=round(82.0 + (i % 17), 1),
                estimated_value=est_val,
                quoted_price=quoted,
                final_value=final_val,
                location=collector.location,
                lat=collector.lat or 9.45,
                lng=collector.lng or 77.3,
                status=status,
                image_url=f"/assets/ewaste_{mat.lower().replace(' ', '_')}.jpg",
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=15 - (i % 14), hours=i % 24)
            )
            db.add(lot)
            lot_records.append(lot)

            # Traceability events for this lot
            status_idx = STATUSES.index(status)
            completed_count = max(1, min(len(TRACE_STEPS), int((status_idx / len(STATUSES)) * len(TRACE_STEPS)) + 2))

            for t_idx, label in enumerate(TRACE_STEPS):
                trc_id = f"TRC-{lot_id[4:]}-{str(t_idx + 1).zfill(2)}"
                is_done = t_idx < completed_count
                is_active = (t_idx == completed_count)
                event = TraceabilityEvent(
                    id=trc_id,
                    lot_id=lot_id,
                    label=label,
                    done=is_done,
                    active=is_active,
                    timestamp=f"2026-09-{str(1 + (t_idx % 13)).zfill(2)} 10:{str((t_idx * 7) % 60).zfill(2)}" if is_done else None,
                    location=collector.location,
                    weight=weight,
                    responsible=collector.id if t_idx < 7 else recycler.id
                )
                db.add(event)

        db.flush()

        # 5. Transactions (30 Transactions)
        for i, lot in enumerate(lot_records[:30]):
            txn_id = f"TXN-2026-{str(i + 1).zfill(6)}"
            recycler = db.query(Recycler).filter(Recycler.id == lot.recycler_id).first()
            recycler_name = recycler.name if recycler else "Authorized Recycler"
            txn = Transaction(
                id=txn_id,
                lot_id=lot.id,
                collector_id=lot.collector_id,
                recycler_id=lot.recycler_id,
                material=lot.material,
                weight=lot.weight,
                quoted_price=lot.quoted_price,
                final_price=lot.final_value or lot.quoted_price,
                payment_status="PAID" if i % 4 != 0 else "PENDING",
                payment_method="Cash" if i % 2 == 0 else "Digital",
                collection_location=lot.location,
                handover_location=recycler_name,
                date=f"2026-09-{str(1 + (i % 13)).zfill(2)}",
                status="COMPLETED" if i % 4 != 0 else "PROCESSING"
            )
            db.add(txn)

        # 6. Price Board Items
        for i, mat in enumerate(MATERIALS):
            base_price = 120 + i * 35
            rec = recycler_records[i % len(recycler_records)]
            price = Price(
                material=mat,
                sub_category="Sorted Grade A",
                location=rec.location or LOCATIONS[i % len(LOCATIONS)],
                buying_price=float(base_price),
                quoted_price=float(base_price * 1.15),
                unit="kg",
                recycler=rec.name,
                last_updated="2026-09-13",
                history=[round(base_price * (0.85 + (j * 0.03)), 1) for j in range(12)]
            )
            db.add(price)

        # 7. Activity Logs
        for i in range(25):
            lot = lot_records[i % len(lot_records)]
            act = ActivityLog(
                id=f"ACT-{str(i + 1).zfill(5)}",
                user_id=lot.collector_id if i % 2 == 0 else lot.recycler_id,
                role="Collector" if i % 2 == 0 else "Recycler",
                action=f"Lot {lot.id} status updated to {lot.status}",
                lot_id=lot.id,
                timestamp=f"2026-09-{str(1 + (i % 13)).zfill(2)} 14:{str((i * 9) % 60).zfill(2)}",
                location=lot.location
            )
            db.add(act)

        # 8. Notifications
        notifications = [
            Notification(role_target="RECYCLER", title="New Lot Request", detail="LOT-2026-000001", read=False, time="5m ago"),
            Notification(role_target="RECYCLER", title="Pickup Scheduled", detail="LOT-2026-000004", read=False, time="1h ago"),
            Notification(role_target="ADMIN", title="Authorized Recycler Verified", detail="EC-REC-000001 Ascent Urban Recyclers", read=True, time="2h ago"),
            Notification(role_target="ADMIN", title="High Volume Collection", detail="COL-2026-000003 completed 50kg lot", read=True, time="Yesterday")
        ]
        for n in notifications:
            db.add(n)

        db.commit()
        return {"status": "success", "imported_recyclers": len(recycler_records)}

    except Exception as e:
        db.rollback()
        raise e
    finally:
        if close_at_end:
            db.close()

