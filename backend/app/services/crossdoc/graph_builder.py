from typing import List, Dict, Any

class CrossDocGraphBuilder:
    @classmethod
    def build_graph(
        cls,
        investigation_id: str,
        documents: List[Dict[str, Any]],
        fields_by_doc: Dict[str, List[Dict[str, Any]]],
        findings: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        nodes = []
        edges = []

        # 1. Document Nodes
        doc_x = 50
        doc_y = 50
        y_step = 160

        for i, doc in enumerate(documents):
            doc_id = doc["id"]
            node_id = f"doc_{doc_id}"
            nodes.append({
                "id": node_id,
                "type": "documentNode",
                "position": {"x": doc_x, "y": doc_y + (i * y_step)},
                "data": {
                    "id": doc_id,
                    "filename": doc["filename"],
                    "document_type": doc.get("document_type", "unknown"),
                    "sha256": doc.get("sha256", "")[:12] + "...",
                    "page_count": doc.get("page_count", 1),
                    "file_type": doc.get("file_type", "pdf")
                }
            })

        # 2. Entity / Field Nodes
        entity_x = 420
        entity_y = 50
        entity_count = 0

        entity_map = {}
        for doc_id, f_list in fields_by_doc.items():
            for f in f_list:
                f_name = f["field_name"]
                f_val = f["raw_value"]
                if f["field_type"] in ["person_name", "currency", "address"]:
                    key = f"{f_name}_{f_val}"
                    if key not in entity_map:
                        node_id = f"field_{f['id']}"
                        entity_map[key] = {
                            "node_id": node_id,
                            "field_name": f_name,
                            "value": f_val,
                            "type": f["field_type"],
                            "doc_ids": [doc_id]
                        }
                        nodes.append({
                            "id": node_id,
                            "type": "entityNode",
                            "position": {"x": entity_x, "y": entity_y + (entity_count * 110)},
                            "data": {
                                "id": f["id"],
                                "label": f_name.replace("_", " ").title(),
                                "value": f_val,
                                "field_type": f["field_type"]
                            }
                        })
                        entity_count += 1
                    else:
                        entity_map[key]["doc_ids"].append(doc_id)

                    edges.append({
                        "id": f"e_doc_{doc_id}_{f['id']}",
                        "source": f"doc_{doc_id}",
                        "target": entity_map[key]["node_id"],
                        "label": "contains",
                        "animated": False,
                        "style": {"stroke": "#94A3B8", "strokeWidth": 1.5}
                    })

        # 3. Finding Nodes
        finding_x = 800
        finding_y = 60

        for j, finding in enumerate(findings):
            finding_node_id = f"finding_{finding['id']}"
            severity_colors = {
                "CRITICAL": "#EF4444",
                "HIGH": "#F59E0B",
                "MEDIUM": "#8B5CF6",
                "LOW": "#3B82F6"
            }
            stroke_color = severity_colors.get(finding.get("severity", "MEDIUM"), "#8B5CF6")

            nodes.append({
                "id": finding_node_id,
                "type": "findingNode",
                "position": {"x": finding_x, "y": finding_y + (j * 180)},
                "data": {
                    "id": finding["id"],
                    "title": finding["title"],
                    "category": finding["category"],
                    "severity": finding["severity"],
                    "review_status": finding.get("review_status", "UNREVIEWED"),
                    "grade": finding.get("grade", "POTENTIAL_ANOMALY")
                }
            })

            for ev in finding.get("evidence_items", []):
                ref_doc = ev.get("document_id")
                ref_field = ev.get("reference_field_id")
                source_id = f"field_{ref_field}" if ref_field else f"doc_{ref_doc}"
                if any(n["id"] == source_id for n in nodes):
                    edges.append({
                        "id": f"e_finding_{finding['id']}_{ev.get('id', str(j))}",
                        "source": source_id,
                        "target": finding_node_id,
                        "label": "contradicts" if finding.get("severity") in ["CRITICAL", "HIGH"] else "evidences",
                        "animated": True,
                        "style": {"stroke": stroke_color, "strokeWidth": 2}
                    })

        return {"nodes": nodes, "edges": edges}
