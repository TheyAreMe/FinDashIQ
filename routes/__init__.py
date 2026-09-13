from flask import Flask
from routes.auth_routes import auth_bp
from routes.stock_routes import stock_bp
from routes.ai_routes import ai_bp
from routes.scanner_routes import scanner_bp
from routes.paper_trade_routes import paper_trade_bp
from routes.alert_routes import alert_bp
from routes.admin_routes import admin_bp
from routes.i18n_routes import i18n_bp


def register_blueprints(app: Flask) -> None:
    """Registers all domain-specific Flask Blueprints onto the application."""
    app.register_blueprint(auth_bp)
    app.register_blueprint(stock_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(scanner_bp)
    app.register_blueprint(paper_trade_bp)
    app.register_blueprint(alert_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(i18n_bp)
