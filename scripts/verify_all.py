"""Verification utility for API documents, extraction output, and exports."""
import json
import urllib.request


def verify():
    base_url = "http://localhost:8000"
    try:
        res = urllib.request.urlopen(f"{base_url}/health")
        health = json.loads(res.read().decode())
        print(f"Server health status: {health.get('status')}")
    except Exception as e:
        print(f"Could not connect to {base_url}: {e}")
        return

    try:
        res = urllib.request.urlopen(f"{base_url}/api/history")
        jobs = json.loads(res.read().decode())
        print(f"Total analysis records found: {len(jobs)}")
        for job in jobs[:5]:
            job_id = job["id"]
            title = job.get("title", "Untitled")
            print(f"\n--- Job: {title} (ID: {job_id}) ---")
            ana_res = urllib.request.urlopen(f"{base_url}/api/results/{job_id}")
            ana = json.loads(ana_res.read().decode())
            print(f"Objectives: {len(ana.get('objectives', []))}")
            print(f"Skills: {len(ana.get('skills', []))}")
            print(f"Concepts: {len(ana.get('concepts', []))}")
            print(f"Coverage Score: {ana.get('coverage_score')}%")
    except Exception as e:
        print(f"Error fetching records: {e}")


if __name__ == "__main__":
    verify()
