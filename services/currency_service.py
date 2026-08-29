import os
import json
import time
import yfinance as yf

# Fallback static rates against USD if network is offline
DEFAULT_USD_RATES = {
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.79,
    "CHF": 0.88,
    "NOK": 10.65,
    "JPY": 154.50,
    "CAD": 1.36,
    "AUD": 1.52,
    "SEK": 10.45,
    "DKK": 6.87
}

# Forex tickers on Yahoo Finance (Pair to USD)
FOREX_TICKERS = {
    "EUR": "EURUSD=X",  # 1 EUR = X USD -> rate_to_usd = 1 / X
    "GBP": "GBPUSD=X",  # 1 GBP = X USD -> rate_to_usd = 1 / X
    "AUD": "AUDUSD=X",  # 1 AUD = X USD -> rate_to_usd = 1 / X
    "CHF": "USDCHF=X",  # 1 USD = X CHF
    "NOK": "USDNOK=X",  # 1 USD = X NOK
    "JPY": "USDJPY=X",  # 1 USD = X JPY
    "CAD": "USDCAD=X",  # 1 USD = X CAD
    "SEK": "USDSEK=X",  # 1 USD = X SEK
    "DKK": "USDDKK=X",  # 1 USD = X DKK
}


class CurrencyService:
    """
    Forex conversion service providing real-time exchange rates against USD
    with persistent disk and in-memory caching (1-hour cache expiry).
    """

    def __init__(self):
        self.cache_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'cache', 'forex_rates.json')
        os.makedirs(os.path.dirname(self.cache_file), exist_ok=True)
        self._memory_cache = None
        self._last_fetch = 0
        self.cache_ttl = 3600  # 1 hour TTL

    def get_rates(self) -> dict:
        """
        Retrieves live exchange rates relative to USD (1 USD = X Currency).
        Uses memory cache -> disk cache -> live yfinance fetch -> fallback defaults.
        """
        now = time.time()

        # 1. In-memory check
        if self._memory_cache and (now - self._last_fetch < self.cache_ttl):
            return self._memory_cache

        # 2. Disk cache check
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    cached_data = json.load(f)
                if cached_data and 'timestamp' in cached_data and (now - cached_data['timestamp'] < self.cache_ttl):
                    self._memory_cache = cached_data.get('rates', DEFAULT_USD_RATES)
                    self._last_fetch = cached_data['timestamp']
                    return self._memory_cache
            except Exception:
                pass

        # 3. Live Fetch from Yahoo Finance
        rates = dict(DEFAULT_USD_RATES)
        try:
            symbols = list(FOREX_TICKERS.values())
            # Batch fetch via yfinance Tickers
            tickers = yf.Tickers(' '.join(symbols))
            for curr, symbol in FOREX_TICKERS.items():
                try:
                    t = tickers.tickers.get(symbol)
                    if t:
                        fast_info = getattr(t, 'fast_info', None)
                        price = None
                        if fast_info and hasattr(fast_info, 'last_price') and fast_info.last_price is not None:
                            price = float(fast_info.last_price)
                        elif fast_info and hasattr(fast_info, 'previous_close') and fast_info.previous_close is not None:
                            price = float(fast_info.previous_close)

                        if price and price > 0:
                            if symbol in ["EURUSD=X", "GBPUSD=X", "AUDUSD=X"]:
                                # Convert (1 CURR = price USD) to (1 USD = 1/price CURR)
                                rates[curr] = round(1.0 / price, 4)
                            else:
                                # Standard direct rate (1 USD = price CURR)
                                rates[curr] = round(price, 4)
                except Exception:
                    continue

            self._memory_cache = rates
            self._last_fetch = now

            # Save to disk
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump({
                    "timestamp": now,
                    "last_updated": time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime(now)),
                    "base": "USD",
                    "rates": rates
                }, f, indent=2)

            return rates

        except Exception as e:
            print(f"[CurrencyService] Failed to fetch live forex rates: {e}. Using cached/fallback rates.")
            self._memory_cache = rates
            return rates

    def convert(self, amount: float, from_currency: str, to_currency: str) -> float:
        """
        Converts an amount from one currency to another using the USD exchange rate matrix.
        Handles GBp (British Pence) normalization.
        """
        if amount is None or amount == 0:
            return 0.0

        from_curr = (from_currency or 'USD').upper().strip()
        to_curr = (to_currency or 'USD').upper().strip()

        # Handle GBp (pence) -> convert to GBP (pounds) first
        is_pence = False
        if from_curr == 'GBP' and from_currency == 'GBp':
            amount = amount / 100.0
        elif from_curr == 'GBp':
            amount = amount / 100.0
            from_curr = 'GBP'

        if from_curr == to_curr:
            return round(amount, 4)

        rates = self.get_rates()
        from_rate = rates.get(from_curr, 1.0)
        to_rate = rates.get(to_curr, 1.0)

        # Convert to USD first, then to target currency
        amount_in_usd = amount / from_rate
        converted_amount = amount_in_usd * to_rate

        return round(converted_amount, 4)
