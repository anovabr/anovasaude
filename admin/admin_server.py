#!/usr/bin/env python3
"""
Unified Server - Serves both user site and admin panel
Located in /admin folder
"""

from flask import Flask, request, jsonify, send_from_directory
import json
from pathlib import Path

# Paths - ADMIN_DIR is where this script is located
ADMIN_DIR = Path(__file__).parent.absolute()
ROOT_DIR = ADMIN_DIR.parent  # Parent folder is the root
TESTS_DIR = ROOT_DIR / "tests"
CSS_DIR = ROOT_DIR / "css"
JS_DIR = ROOT_DIR / "js"
IMG_DIR = ROOT_DIR / "img"

# Ensure tests directory exists
TESTS_DIR.mkdir(exist_ok=True)

app = Flask(__name__)

# ===== MAIN SITE ROUTES =====

@app.route('/')
def index():
    """Serve main homepage"""
    return send_from_directory(ROOT_DIR, 'index.html')

@app.route('/catalogo.html')
def catalogo():
    """Serve catalog page"""
    return send_from_directory(ROOT_DIR, 'catalogo.html')

@app.route('/dashboard.html')
def dashboard_user():
    """Serve user dashboard (test results)"""
    return send_from_directory(ROOT_DIR, 'dashboard.html')

@app.route('/test.html')
def test_runner():
    """Serve test runner"""
    return send_from_directory(ROOT_DIR, 'test.html')

# Static files
@app.route('/logo.png')
def serve_logo():
    return send_from_directory(ROOT_DIR, 'logo.png')

@app.route('/logo_white.jpg')
def serve_logo_white():
    return send_from_directory(ROOT_DIR, 'logo_white.jpg')

@app.route('/logo_icon.ico')
def serve_logo_icon():
    return send_from_directory(ROOT_DIR, 'logo_icon.ico')

@app.route('/css/<path:filename>')
def css_files(filename):
    return send_from_directory(CSS_DIR, filename)

@app.route('/js/<path:filename>')
def js_files(filename):
    return send_from_directory(JS_DIR, filename)

@app.route('/img/<path:filename>')
def img_files(filename):
    return send_from_directory(IMG_DIR, filename)

@app.route('/tests/index.json')
def serve_index_json():
    """Serve the tests index file"""
    return send_from_directory(TESTS_DIR, 'index.json')

@app.route('/tests/<test_id>.json')
def serve_test_json(test_id):
    """Serve individual test JSON files"""
    return send_from_directory(TESTS_DIR, f'{test_id}.json')

# ===== ADMIN PANEL ROUTES =====

@app.route('/admin')
@app.route('/admin/')
def admin():
    """Serve admin panel"""
    return send_from_directory(ADMIN_DIR, 'admin.html')

@app.route('/admin/test-builder')
@app.route('/admin/test-builder/')
def test_builder():
    """Serve test builder"""
    return send_from_directory(ADMIN_DIR, 'test-builder.html')

# ===== API ROUTES =====

@app.route('/api/tests', methods=['GET'])
def get_tests():
    """Get all tests"""
    try:
        tests = []
        for test_file in TESTS_DIR.glob("*.json"):
            if test_file.name != "index.json":
                with open(test_file, 'r', encoding='utf-8') as f:
                    tests.append(json.load(f))
        return jsonify({'success': True, 'tests': tests})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/tests/<test_id>', methods=['GET'])
def get_single_test(test_id):
    """Get single test"""
    try:
        test_file = TESTS_DIR / f"{test_id}.json"
        if not test_file.exists():
            return jsonify({'success': False, 'error': 'Test not found'}), 404
        with open(test_file, 'r', encoding='utf-8') as f:
            return jsonify({'success': True, 'test': json.load(f)})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/tests', methods=['POST'])
def create_test():
    """Create test"""
    try:
        test_data = request.json
        test_id = test_data.get('id')
        if not test_id:
            return jsonify({'success': False, 'error': 'Test ID required'}), 400
        
        test_file = TESTS_DIR / f"{test_id}.json"
        if test_file.exists():
            return jsonify({'success': False, 'error': 'Test ID exists'}), 400
        
        with open(test_file, 'w', encoding='utf-8') as f:
            json.dump(test_data, f, indent=2, ensure_ascii=False)
        rebuild_index()
        return jsonify({'success': True, 'message': f'Test {test_id} created'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/tests/<test_id>', methods=['PUT'])
def update_test(test_id):
    """Update test"""
    try:
        test_file = TESTS_DIR / f"{test_id}.json"
        if not test_file.exists():
            return jsonify({'success': False, 'error': 'Test not found'}), 404
        
        with open(test_file, 'w', encoding='utf-8') as f:
            json.dump(request.json, f, indent=2, ensure_ascii=False)
        rebuild_index()
        return jsonify({'success': True, 'message': f'Test {test_id} updated'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/tests/<test_id>', methods=['DELETE'])
def delete_test(test_id):
    """Delete test"""
    try:
        test_file = TESTS_DIR / f"{test_id}.json"
        if not test_file.exists():
            return jsonify({'success': False, 'error': 'Test not found'}), 404
        test_file.unlink()
        rebuild_index()
        return jsonify({'success': True, 'message': f'Test {test_id} deleted'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get stats"""
    try:
        tests = []
        for test_file in TESTS_DIR.glob("*.json"):
            if test_file.name != "index.json":
                with open(test_file, 'r', encoding='utf-8') as f:
                    tests.append(json.load(f))
        
        stats = {
            'total_tests': len(tests),
            'para_voce': len([t for t in tests if t.get('category') == 'para-voce']),
            'para_seu_filho': len([t for t in tests if t.get('category') == 'para-seu-filho']),
            'featured': len([t for t in tests if t.get('featured')]),
            'curadoria': len([t for t in tests if t.get('curadoria')])
        }
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def rebuild_index():
    """Rebuild index.json"""
    try:
        tests = []
        for test_file in sorted(TESTS_DIR.glob("*.json")):
            if test_file.name != "index.json":
                with open(test_file, 'r', encoding='utf-8') as f:
                    tests.append(json.load(f))
        
        with open(TESTS_DIR / "index.json", 'w', encoding='utf-8') as f:
            json.dump(tests, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error rebuilding index: {e}")
        return False

if __name__ == '__main__':
    print("\n" + "="*60)
    print("ANOVA SAÚDE - SERVER")
    print("="*60)
    print(f"Root:    {ROOT_DIR}")
    print(f"Tests:   {TESTS_DIR}")
    print(f"\nURLs:")
    print(f"  Homepage:     http://localhost:8000")
    print(f"  Catalog:      http://localhost:8000/catalogo.html")
    print(f"  Admin:        http://localhost:8000/admin")
    print(f"  Builder:      http://localhost:8000/admin/test-builder")
    print("\nPress Ctrl+C to stop\n" + "="*60 + "\n")
    
    app.run(debug=True, port=8000, host='localhost')