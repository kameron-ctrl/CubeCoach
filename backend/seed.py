"""Seed script — creates demo user and all OLL/PLL algorithms."""

from datetime import datetime, timedelta, timezone
from models.database import Base, engine, SessionLocal
from models.user import User
from models.algorithm_mastery import AlgorithmMastery
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# All 57 OLL algorithms
OLL_ALGORITHMS = [
    ("OLL-1", "R U2 R2 F R F' U2 R' F R F'", "All edges flipped (dot)"),
    ("OLL-2", "F R U R' U' F' f R U R' U' f'", "Dot case"),
    ("OLL-3", "f R U R' U' f' U' F R U R' U' F'", "Dot case L-shape"),
    ("OLL-4", "f R U R' U' f' U F R U R' U' F'", "Dot case inverse L"),
    ("OLL-5", "r' U2 R U R' U r", "Square shape"),
    ("OLL-6", "r U2 R' U' R U' r'", "Square shape mirror"),
    ("OLL-7", "r U R' U R U2 r'", "Small lightning bolt"),
    ("OLL-8", "r' U' R U' R' U2 r", "Small lightning bolt mirror"),
    ("OLL-9", "R U R' U' R' F R2 U R' U' F'", "Fish shape"),
    ("OLL-10", "R U R' U R' F R F' R U2 R'", "Fish shape mirror"),
    ("OLL-11", "r U R' U R' F R F' R U2 r'", "Small L shape"),
    ("OLL-12", "M' R' U' R U' R' U2 R U' M", "Small L shape mirror"),
    ("OLL-13", "F U R U' R2 F' R U R U' R'", "Knight move"),
    ("OLL-14", "R' F R U R' F' R F U' F'", "Knight move mirror"),
    ("OLL-15", "r' U' r R' U' R U r' U r", "Knight move alt"),
    ("OLL-16", "r U r' R U R' U' r U' r'", "Knight move alt mirror"),
    ("OLL-17", "R U R' U R' F R F' U2 R' F R F'", "Dot with bar"),
    ("OLL-18", "r U R' U R U2 r2 U' R U' R' U2 r", "Dot variation"),
    ("OLL-19", "r' R U R U R' U' M' R' F R F'", "Dot variation 2"),
    ("OLL-20", "r U R' U' M2 U R U' R' U' M'", "X shape (dot)"),
    ("OLL-21", "R U2 R' U' R U R' U' R U' R'", "Cross, all corners oriented"),
    ("OLL-22", "R U2 R2 U' R2 U' R2 U2 R", "Cross, diagonal corners"),
    ("OLL-23", "R2 D' R U2 R' D R U2 R", "Cross, headlights"),
    ("OLL-24", "r U R' U' r' F R F'", "Cross, chameleon"),
    ("OLL-25", "F' r U R' U' r' F R", "Cross, bowtie"),
    ("OLL-26", "R U2 R' U' R U' R'", "Cross, Sune"),
    ("OLL-27", "R U R' U R U2 R'", "Cross, anti-Sune"),
    ("OLL-28", "r U R' U' r' R U R U' R'", "Cross, arrow"),
    ("OLL-29", "R U R' U' R U' R' F' U' F R U R'", "Awkward shape"),
    ("OLL-30", "F R' F R2 U' R' U' R U R' F2", "Awkward shape mirror"),
    ("OLL-31", "R' U' F U R U' R' F' R", "P shape"),
    ("OLL-32", "L U F' U' L' U L F L'", "P shape mirror"),
    ("OLL-33", "R U R' U' R' F R F'", "T shape"),
    ("OLL-34", "R U R2 U' R' F R U R U' F'", "C shape"),
    ("OLL-35", "R U2 R2 F R F' R U2 R'", "Fish"),
    ("OLL-36", "L' U' L U' L' U L U L F' L' F", "W shape"),
    ("OLL-37", "F R' F' R U R U' R'", "Fish mirror"),
    ("OLL-38", "R U R' U R U' R' U' R' F R F'", "W shape mirror"),
    ("OLL-39", "L F' L' U' L U F U' L'", "Big lightning"),
    ("OLL-40", "R' F R U R' U' F' U R", "Big lightning mirror"),
    ("OLL-41", "R U R' U R U2 R' F R U R' U' F'", "Awkward"),
    ("OLL-42", "R' U' R U' R' U2 R F R U R' U' F'", "Awkward mirror"),
    ("OLL-43", "F' U' L' U L F", "P shape small"),
    ("OLL-44", "F U R U' R' F'", "P shape small mirror"),
    ("OLL-45", "F R U R' U' F'", "T shape (line)"),
    ("OLL-46", "R' U' R' F R F' U R", "C shape line"),
    ("OLL-47", "R' U' R' F R F' R' F R F' U R", "Small L"),
    ("OLL-48", "F R U R' U' R U R' U' F'", "Line I shape"),
    ("OLL-49", "r U' r2 U r2 U r2 U' r", "Line variation"),
    ("OLL-50", "r' U r2 U' r2 U' r2 U r'", "Line variation mirror"),
    ("OLL-51", "F U R U' R' U R U' R' F'", "I shape"),
    ("OLL-52", "R U R' U R U' B U' B' R'", "I shape mirror"),
    ("OLL-53", "r' U' R U' R' U R U' R' U2 r", "L shape"),
    ("OLL-54", "r U R' U R U' R' U R U2 r'", "L shape mirror"),
    ("OLL-55", "R U2 R2 U' R U' R' U2 F R F'", "Highway"),
    ("OLL-56", "r' U' r U' R' U R U' R' U R r' U r", "Crown"),
    ("OLL-57", "R U R' U' M' U R U' r'", "H shape"),
]

# All 21 PLL algorithms
PLL_ALGORITHMS = [
    ("PLL-Aa", "x R' U R' D2 R U' R' D2 R2 x'", "A-perm (a): adjacent corner swap"),
    ("PLL-Ab", "x R2 D2 R U R' D2 R U' R x'", "A-perm (b): adjacent corner swap"),
    ("PLL-E", "x' R U' R' D R U R' D' R U R' D R U' R' D' x", "E-perm: diagonal corner swap"),
    ("PLL-F", "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", "F-perm: diagonal with edge"),
    ("PLL-Ga", "R2 U R' U R' U' R U' R2 U' D R' U R D'", "G-perm (a)"),
    ("PLL-Gb", "R' U' R U D' R2 U R' U R U' R U' R2 D", "G-perm (b)"),
    ("PLL-Gc", "R2 U' R U' R U R' U R2 U D' R U' R' D", "G-perm (c)"),
    ("PLL-Gd", "R U R' U' D R2 U' R U' R' U R' U R2 D'", "G-perm (d)"),
    ("PLL-H", "M2 U M2 U2 M2 U M2", "H-perm: edges only, opposite swap"),
    ("PLL-Ja", "x R2 F R F' R U2 r' U r U2 x'", "J-perm (a): adjacent corner + edge"),
    ("PLL-Jb", "R U R' F' R U R' U' R' F R2 U' R'", "J-perm (b): adjacent corner + edge"),
    ("PLL-Na", "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", "N-perm (a): diagonal swap"),
    ("PLL-Nb", "R' U R U' R' F' U' F R U R' F R' F' R U' R", "N-perm (b): diagonal swap"),
    ("PLL-Ra", "R U R' F' R U2 R' U2 R' F R U R U2 R'", "R-perm (a)"),
    ("PLL-Rb", "R' U2 R U2 R' F R U R' U' R' F' R2", "R-perm (b)"),
    ("PLL-T", "R U R' U' R' F R2 U' R' U' R U R' F'", "T-perm: adjacent corner + edge"),
    ("PLL-Ua", "R U' R U R U R U' R' U' R2", "U-perm (a): 3 edges clockwise"),
    ("PLL-Ub", "R2 U R U R' U' R' U' R' U R'", "U-perm (b): 3 edges counter-clockwise"),
    ("PLL-V", "R' U R' U' B' R' B2 U' B' U B' R B R", "V-perm: diagonal"),
    ("PLL-Y", "F R U' R' U' R U R' F' R U R' U' R' F R F'", "Y-perm: diagonal corner + edge"),
    ("PLL-Z", "M' U M2 U M2 U M' U2 M2", "Z-perm: opposite edge swap"),
]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Create demo user if not exists
    demo = db.query(User).filter(User.username == "CubeNewbie").first()
    if not demo:
        demo = User(
            username="CubeNewbie",
            email="demo@cubecoach.dev",
            hashed_password=pwd_context.hash("demo123"),
            current_method="cfop",
            skill_level="intermediate",
            streak_days=12,
        )
        db.add(demo)
        db.commit()
        db.refresh(demo)
        print(f"Created demo user: CubeNewbie (id={demo.id})")
    else:
        print(f"Demo user exists (id={demo.id})")

    # Seed algorithms if not already seeded
    existing = db.query(AlgorithmMastery).filter(AlgorithmMastery.user_id == demo.id).count()
    if existing == 0:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        all_algs = OLL_ALGORITHMS + PLL_ALGORITHMS
        for name, notation, desc in all_algs:
            alg = AlgorithmMastery(
                user_id=demo.id,
                algorithm_name=name,
                algorithm_notation=notation,
                description=desc,
                ease_factor=2.5,
                interval_days=1,
                repetitions=0,
                next_review=now,
            )
            db.add(alg)
        db.commit()
        print(f"Seeded {len(all_algs)} algorithms for user {demo.id}")
    else:
        print(f"Algorithms already seeded ({existing} found)")

    db.close()


if __name__ == "__main__":
    seed()
