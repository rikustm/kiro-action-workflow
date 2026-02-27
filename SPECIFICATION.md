Functional Specification — Workflow Documentation Application (MVP v1.2)

1. Purpose

The application enables users to document, visualize, and maintain sequential workflows consisting of tasks and optional decision points that allow conditional skipping of steps and later merging back into the main flow.

The system is designed for documentation, not execution.

⸻

2. Scope (MVP)

The MVP includes:
• Create and manage workflows
• Sequential task modeling with optional branching & merging
• Graphical workflow diagram editor
• Inline (in-place) editing
• Versioning with Draft → Published lifecycle
• Granular per-workflow permissions (Viewer / Editor / Admin)
• Configurable task types with custom schemas
• Export current version to PDF (table + diagram)

Out of scope:
• Logical condition expressions
• Attachments or external links
• Real-time collaborative editing
• Workflow execution engine

⸻

3. Core Concepts

3.1 Workflow Nature
• Default flow is sequential
• Decision nodes allow skipping steps
• Branches may merge back into later steps
• Start and End are implicit:
• Start = first reachable node
• End = nodes without outgoing connections

⸻

4. Data Model

4.1 Workflow

Represents a process definition.

Fields:
• workflow_id
• title (required)
• description
• status = Draft | Published | Archived
• current_version_id
• created_by
• created_at
• updated_at

⸻

4.2 Workflow Version

Each change creates a new version.

Fields:
• version_id
• workflow_id
• version_number
• change_note (optional)
• created_by
• created_at
• is_published (boolean)

Rules:
• Only one version can be published
• Published versions are immutable
• Editing a published workflow creates a new Draft version

⸻

4.3 Node (Abstract)

Base structure for all steps.

Fields:
• node_id
• workflow_version_id
• node_type = TASK | DECISION
• name (required)
• description
• position_x
• position_y

⸻

4.4 Task Node

Represents a concrete step in the workflow.

Additional fields:
• task_type_id (required)
• task_data (JSON, based on schema)

⸻

4.5 Decision Node

Represents a conditional branch used to skip steps.

Additional fields:
• decision_question (optional; name may suffice)

Rules:
• Must have ≥ 2 outgoing connections

⸻

4.6 Connection (Flow Edge)

Represents directional flow between nodes.

Fields:
• connection_id
• from_node_id
• to_node_id
• label (simple text: e.g., Yes / No / Skip)

Rules:
• Branches may merge
• Self-loops are not allowed
• Circular flows are not allowed (MVP constraint)

⸻

4.7 Task Type (Configurable)

Defines schema for task-specific fields.

Fields:
• task_type_id
• name
• description
• field_schema (JSON)
• icon
• is_active

Example types:
• Lookup-data
• Change-data
• Notify

⸻

5. Roles & Permissions

Permissions are defined per workflow.

5.1 Roles
• Viewer: read-only access
• Editor: modify workflow content and structure
• Admin:
• Manage permissions
• Publish versions
• Manage task types (global)

⸻

6. Functional Requirements

6.1 Workflow Management

FR-WF-01 Create Workflow

User can create workflow with:
• Title (required)
• Description (optional)

System creates:
• Version 1 (Draft)

⸻

FR-WF-02 Edit Workflow
• Inline edit title and description
• Editing published workflow creates a new Draft version

⸻

FR-WF-03 Publish Version

Admin can publish a draft version.
Effects:
• Version becomes immutable
• Becomes “current version”

⸻

FR-WF-04 Version History

Users can:
• View previous versions (read-only)
• See version number and change note

⸻

FR-WF-05 List View

Displays workflows accessible to user.

Columns:
• Title
• Status
• Current version
• Updated at
• Owner

Actions:
• Open
• Duplicate
• Archive

Filters:
• Status
• Owner

⸻

6.2 Inline Editing (Core UX Principle)

FR-EDIT-01 In-place Editing

Clicking text enables direct editing for:
• Workflow title
• Workflow description
• Node name
• Node description
• Connection labels

Behavior:
• Enter saves
• Esc cancels
• Blur auto-saves
• Visual feedback on save

⸻

6.3 Node Management

FR-NODE-01 Add Task

User can add a task:
• After any existing node
• Select task type
• Fill schema-defined fields
• Edit name/description inline

⸻

FR-NODE-02 Add Decision

User can insert decision before or between tasks.

Behavior:
• Must have ≥ 2 outgoing labeled branches
• Used primarily to skip steps conditionally

⸻

FR-NODE-03 Delete Node
• Removes node and its connections
• Shows confirmation
• Undo recommended (non-blocking requirement)

⸻

6.4 Flow Behavior (Sequential with Skips)

FR-FLOW-01 Sequential Default

Workflow naturally flows step-by-step:
Task A → Task B → Task C

⸻

FR-FLOW-02 Conditional Skip

Decision allows skipping:
Task A → Decision → (Skip) → Task D

⸻

FR-FLOW-03 Merge Support

Multiple branches can rejoin:
Decision:
• Yes → Task B → Task D
• No → Task D

System must support merging flows.

⸻

6.5 Graphical Workflow Editor

FR-DIAG-01 Canvas

Features:
• Pan and zoom
• Drag & reposition nodes
• Connect nodes via drag handles

⸻

FR-DIAG-02 Node Representation

Task:
• Rectangular node
• Shows name + task type badge

Decision:
• Diamond shape
• Shows decision question/name

Connections:
• Directed arrows
• Optional branch labels

⸻

FR-DIAG-03 Outline Panel

Textual list of tasks & decisions in logical sequence.
Clicking item highlights node in diagram.

⸻

6.6 Validation Rules

System warns (non-blocking):
• Decision with <2 branches
• Unreachable nodes
• Dead-end nodes (unless intended)
• Circular flows

Circular connections are prevented.

⸻

6.7 Task Type Configuration

FR-TYPE-01 Admin Management

Admins can:
• Create/edit/deactivate task types
• Define schema fields:
• text, number, boolean, select, multi-select, date

Existing tasks remain readable if type deactivated.

⸻

6.8 Export Functionality

FR-EXP-01 Export Current Version to PDF

User can export the current published version.

PDF contains:

Section 1: Metadata
• Title
• Description
• Version number
• Created / Updated info

Section 2: Table of Tasks

Columns:
• Step #
• Name
• Description
• Task Type
• Branch Label (if applicable)
• Next Step(s)

Section 3: Graphical Diagram
• Rendered workflow diagram
• Scaled across pages if needed

⸻

7. UI Structure

7.1 List View
• Table with search/filter
• “Create workflow” button

7.2 Details View (Unified)

Single consistent interface for:
• View
• Edit
• Create

Layout:
• Header: title (inline), version, status
• Left: metadata + version history
• Center: diagram canvas
• Right: contextual node editor panel

⸻

8. Non-Functional Requirements

8.1 Performance
• Support ≥ 200 nodes per workflow
• Inline save feedback < 500ms perceived delay

8.2 Concurrency
• Prevent overwriting newer draft
• Notify user if draft outdated

8.3 Auditability
• All versions retained
• Each version stores creator + timestamp

⸻

9. Acceptance Criteria Summary (MVP)

A workflow application is considered complete when: 1. Users can create workflows with sequential tasks 2. Decision nodes allow skipping and merging steps 3. All text is editable inline 4. Versioning prevents editing published versions 5. Permissions are enforced per workflow 6. Task types are configurable with custom schemas 7. Users can export current version as PDF containing:
• Metadata
• Task table
• Graphical diagram
