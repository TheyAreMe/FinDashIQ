from flask import Blueprint, jsonify, request, session
from services.update_service import update_service
from services.maintenance_service import maintenance_service
from routes.helpers import get_current_user_data_from_session

admin_bp = Blueprint('admin', __name__)


def get_current_user_data():
    return get_current_user_data_from_session(session)


@admin_bp.route('/api/admin/check-updates', methods=['GET', 'POST'])
def api_check_updates():
    """Queries GitHub Releases for FinDashIQ updates with rate-limited caching."""
    user, _ = get_current_user_data()
    is_admin = bool(user and user.get('role') == 'admin')

    force = request.args.get('force', 'false').lower() in ('true', '1', 'yes')
    if request.method == 'POST':
        force = True

    result = update_service.check_for_updates(force_refresh=force)
    result['isAdmin'] = is_admin
    status_code = 200 if result.get('success', True) else 500
    return jsonify(result), status_code


@admin_bp.route('/api/admin/maintenance/status', methods=['GET'])
def api_maintenance_status():
    """Admin-only: Returns real-time server RAM metrics, cache telemetry, and health info."""
    user, _ = get_current_user_data()
    if not user or user.get('role') != 'admin':
        return jsonify({"success": False, "message": "Administrator privileges required."}), 403

    status = maintenance_service.get_maintenance_status()
    return jsonify(status), 200


@admin_bp.route('/api/admin/maintenance/optimize', methods=['POST'])
def api_maintenance_optimize():
    """Admin-only: 1-Click UI RAM optimization, cache sanitization, and OS heap defragmentation."""
    user, _ = get_current_user_data()
    if not user or user.get('role') != 'admin':
        return jsonify({"success": False, "message": "Administrator privileges required."}), 403

    result = maintenance_service.optimize_memory()
    return jsonify(result), 200


@admin_bp.route('/api/admin/maintenance/restart', methods=['POST'])
@admin_bp.route('/api/admin/maintenance/soft-restart', methods=['POST'])
def api_maintenance_restart():
    """Admin-only: Triggers a graceful zero-downtime worker recycle (Gunicorn) or soft in-place reload."""
    user, _ = get_current_user_data()
    if not user or user.get('role') != 'admin':
        return jsonify({"success": False, "message": "Administrator privileges required."}), 403

    result = maintenance_service.soft_restart_server()
    return jsonify(result), 200

