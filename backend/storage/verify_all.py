import urllib.request
import json

def verify():
    res = urllib.request.urlopen('http://localhost:8000/api/documents')
    docs = json.loads(res.read().decode())
    print(f"Total documents found: {len(docs)}")
    for d in docs:
        doc_id = d['id']
        filename = d['filename']
        print(f"\n--- Document: {filename} (ID: {doc_id}) ---")
        ana_res = urllib.request.urlopen(f'http://localhost:8000/api/analysis/{doc_id}')
        ana = json.loads(ana_res.read().decode())
        print(f"Objectives count: {len(ana.get('learning_objectives', []))}")
        print(f"Concepts count: {len(ana.get('key_concepts', []))}")
        print(f"Questions count: {len(ana.get('assessment_questions', []))}")
        
        # Test exports
        for fmt in ['json', 'csv', 'md', 'pdf']:
            exp_res = urllib.request.urlopen(f'http://localhost:8000/api/export/{doc_id}?format={fmt}')
            data = exp_res.read()
            print(f"Export {fmt.upper()}: status={exp_res.status}, size={len(data)} bytes")

if __name__ == '__main__':
    verify()
