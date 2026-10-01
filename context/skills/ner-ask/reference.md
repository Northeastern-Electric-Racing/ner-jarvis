# NER repos and Slack channels — dated snapshot

A quick map so you know what to look up. **Verify live before citing**: run `gh repo view`
for a repo, and check Slack for a channel. Repo lists and channels drift. When this map
disagrees with what you see live, trust what you see live and offer **ner-flag-stale**.

## Slack channels (verified 2026-09-05)

`#software`
  (software-wide announcements), `#tech-support` (setup help + repo/tool access —
  **replaced** the now-archived `#software_env-setup` and `#access-requests`),
  `#s_embedded-software` (**both** embedded/firmware **and Application Software**
  development — Argos and NERO work happens here, since `#software_argos` and
  `#software_nero` are archived), `#software_launchpad` (new members, all software
  teams), `#software_finishline` (FinishLine), `#software_pr-review` (FinishLine
  PRs), `#software_product` (Software Product), `#software_product-requests`
  (feature requests for any NER software). A June 2026 plan to rename these to
  `#s_finishline` / `#s_product` / `#tech_support` was **not** carried out — don't
  cite those names. Norm: post publicly, don't DM leads first.

## Repos members actually touch

Repos marked **(private)** need org access to see — a GitHub 404 there usually
means a permissions gap, not a missing repo.

**FinishLine — TypeScript, full-stack**
- `FinishLine` — Project-management dashboard (a.k.a. PM Dashboard v5), the main
  PM app. (`PM-Dashboard-v2` and v1 are archived — deliberately not listed here.)

**Application Software — TypeScript / Angular / Flutter, full-stack**
- `Argos` — Real-time data **processing** and visualization (Angular + Flutter +
  `scylla-server` + `charybdis-schema`). `scylla`/`siren` are services, not repos.
- `Nero-2.0` — Vehicle dashboard (C++/Qt/QML). An App-Software system — *not*
  telemetry, despite the language.
- `Ithaca` — Data-visualization for telemetry captures (Python); backs the
  roster's **"Data Visualization"** system (a system name, not a repo).

**Firmware / embedded track — C, FreeRTOS, some Rust**
- `Cerberus`, `Cerberus-2.0` — Vehicle Control Unit firmware (FreeRTOS;
  `Cerberus-2.0` is the 25A VCU).
- `Cerberus-1.5` **(private)** — VCU variant on ThreadX/Azure RTOS (STM32F405).
- `Shepherd-BMS`, `TSECU-Shepherd` — Battery-Management-System firmware.
- `adbms` **(private)** — Proprietary ADBMS battery-monitor driver (6830/2950);
  pulled in as a submodule (e.g. by Shepherd-BMS).
- `MSB-FW`, `MSB-FW-2` — FreeRTOS distributed-sensing boards.
- `ProteusMC` — Custom dual HV motor controller.
- `Lightning` — Lightning-board firmware.
- `Polyphemus` — 24A steering-wheel firmware (STM32F405).
- `nermoni` — STM32F103 ADC board.
- `Embedded-Base` — Shared drivers, middleware, dev tools, used as a submodule
  across the firmware repos above.
- `firmware-rs` — Experimental Rust firmware (not yet on the car).
- `h5-projects-rs` — STM32H5 Rust/Embassy firmware projects.
- `Salamander` — FSAE energy-meter firmware.
- `Pythia` — Embedded-Validation HIL test harness. **Firmware, despite being
  written in TypeScript** — don't shelve it as Application Software.

**Telemetry / data — Rust, Python, Go** *(stack is mid-migration from MQTT to
**Zenoh** — MQTT can now be largely disabled; the "MQTT" labels below are
transitional.)*
- `Calypso` — Configurable CAN-to-MQTT gateway (Rust).
- `Odysseus` — On-car MQTT-based telemetry OS (Buildroot + HaLow WiFi).
- `Odysseus-Daemon` — System-state daemon for Odysseus.
- `Odyssey-Definitions` — CANbus and Automotive-Ethernet packet definitions.
- `Odyssey-Configurations` — Car-system configs for the Odyssey framework
  (25A car onward).
- `ner-penelope-rust`, `ner-penelope-python` — Drivers for NER's data store
  (Rust / Python).
- `Telemetry-Stand` — Trackside telemetry-stand project.
- `mqtt-datasource` — Grafana datasource for MQTT streaming (Go; a fork).
- `mqttui` — Terminal MQTT client/TUI (Rust; a fork), used in telemetry work.

**Simulation / analysis — access varies (re-verify visibility; some private)**
- `NERSim` — Lap simulation (Simulink + Python).
- `NERTire` — Tire-analysis ML notebooks.
- `NERMultibody` — Multi-body FSAE-car simulation (newer; now has activity).
- `NERDIL` — Live driver-in-loop multibody simulation (newer; now has activity).
