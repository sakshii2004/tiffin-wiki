# Tiffin.wiki — Monitoring & Analytics Guide

Welcome to the **Tiffin.wiki Telemetry & System Monitoring Dashboard** (`/admin?tab=MONITORING`). This guide explains what every metric, line chart, heat map, and conversion funnel means, how data is collected, and how to interpret actionable business insights.

---

## 1. Category Sub-Tabs Overview

The Monitoring Dashboard is organized into **5 core category sub-tabs**:

1. **Overview**: Executive high-level summary cards, daily activity velocity line chart, and quick health metrics.
2. **Traffic & Dwell Time**: Daily visits/session line charts, 24-hour peak usage heatmaps, top visited route breakdown, and device/browser split.
3. **Search & Filters**: City supply vs demand comparison, top searched keywords, and dietary preference ratio (Pure Veg vs Mixed).
4. **Conversions & Funnels**: Lead generation rates, WhatsApp number reveal conversion, Add Listing submission funnel, and Review submission funnel.
5. **Live Event Stream**: Real-time terminal log feed showing incoming telemetry events with IP/location tags and device metadata.

---

## 2. Metric Cards & What They Mean

| Metric | Description & Calculation | Business & Product Meaning |
| :--- | :--- | :--- |
| **WhatsApp Leads** | Total number of **Number Reveals** (`WHATSAPP_REVEAL`) + **Chat Opens** (`WHATSAPP_OPEN`). | **#1 Conversion KPI**. Measures how many users actively contacted a tiffin provider. |
| **Total Signups** | Total count of registered users in database (`User` model). | Measures community growth and registered user acquisition. |
| **Cities & Tiffins** | Total unique cities covered + total approved live tiffin services. | Measures platform supply footprint across cities (e.g. Pune, Mumbai, Bangalore). |
| **Total Searches** | Total search queries executed via search bar and hero input. | Measures user search intent and active discovery volume. |
| **Reviews & Rating** | Total reviews posted + overall platform average star rating. | Measures user trust, satisfaction, and content quality. |
| **Avg Dwell Time** | Average session dwell time (seconds) per page view (`TIME_SPENT`). | Measures engagement depth. Higher dwell time indicates users are actively reading menus and reviews. |

---

## 3. Interactive Line Charts & Visualizations

### A. Daily Metric Line Chart (Interactive SVG)
- **What it shows**: Visual timeline tracking daily metric counts (**Page Views**, **Unique Visitors**, **Searches**, or **WhatsApp Leads**) over the selected timeframe.
- **How to interact**: Hover over any data point node to see the exact date and numeric value.
- **Key Insight**: Spikes in WhatsApp leads or visits correlate with marketing campaigns or peak weekend searches.

### B. Hourly Usage Heatmap (00:00 - 23:00)
- **What it shows**: Bar intensity breakdown of user activity by hour of the day (in Indian Standard Time).
- **Key Insight**: Identifies peak meal decision times (e.g., 11:00 AM – 1:00 PM for Lunch, 6:00 PM – 8:00 PM for Dinner).

### C. City Supply vs Search Demand Bar Comparison
- **What it shows**: Side-by-side comparison of **Live Tiffin Services** vs **User Search Queries** per city.
- **Actionable Insight**: A city with **high search demand** but **low tiffin supply** represents an urgent opportunity to onboard more local tiffin providers!

### D. Conversion Funnel Breakdowns
1. **WhatsApp Lead Funnel**:
   - `Detail Pageviews` -> `Number Reveals` -> `WhatsApp Opens`
   - **Conversion Rate Formula**: `(WhatsApp Total / Listing Detail Views) * 100`
2. **Add Listing Funnel**:
   - `Visits to /add` -> `ADD_LISTING_SUCCESS`
3. **Review Submission Funnel**:
   - `Review CTA Clicks` -> `REVIEW_SUBMIT_SUCCESS`

---

## 4. Telemetry Privacy & Performance

- **Zero Performance Impact**: Telemetry uses `navigator.sendBeacon` and non-blocking asynchronous requests.
- **Privacy & Security**: Client IP addresses are hashed (`ipHash`) using SHA-256 before storage.
- **Admin Exclusion**: Navigating `/admin` pages is **never** recorded in telemetry to ensure metric purity.
