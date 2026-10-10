import sqlite3

DATABASE = "resume_intelligence.db"

def migrate():
    connection = sqlite3.connect(DATABASE)
    cursor = connection.cursor()

    # -------------------------
    # Check Resume columns
    # -------------------------
    cursor.execute("PRAGMA table_info(resumes)")
    resume_columns = [
        column[1]
        for column in cursor.fetchall()
    ]

    if "admin_id" not in resume_columns:
        cursor.execute(
            """
            ALTER TABLE resumes
            ADD COLUMN admin_id INTEGER
            """
        )
        print("Added admin_id to resumes table")
    else:
        print("resumes.admin_id already exists")

    # -------------------------
    # Check Job columns
    # -------------------------
    cursor.execute("PRAGMA table_info(jobs)")
    job_columns = [
        column[1]
        for column in cursor.fetchall()
    ]

    if "admin_id" not in job_columns:
        cursor.execute(
            """
            ALTER TABLE jobs
            ADD COLUMN admin_id INTEGER
            """
        )
        print("Added admin_id to jobs table")
    else:
        print("jobs.admin_id already exists")

    connection.commit()
    connection.close()

    print("Admin ownership migration completed successfully.")


if __name__ == "__main__":
    migrate()