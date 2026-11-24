"""Offline contract checks for the demonstration's request and response handling."""

import json
import unittest

from jev_check import ABSTAIN, EVIDENCE, MODEL, advisory, requests_for


class DemoTests(unittest.TestCase):
    def test_only_candidate_order_changes(self):
        evidence = json.loads(EVIDENCE.read_text(encoding="utf-8-sig"))
        for question in ("negative", "positive"):
            (first_order, first_json), (second_order, second_json) = requests_for(evidence, question)
            first, second = json.loads(first_json), json.loads(second_json)
            self.assertEqual((first_order, second_order), ("forward", "reverse"))
            self.assertEqual(first, second)
            self.assertEqual(list(first["questions"]["candidate"]["criteria"]), ["routing", "applications", ABSTAIN])
            self.assertEqual(list(second["questions"]["candidate"]["criteria"]), ["applications", "routing", ABSTAIN])

    def test_advisory_requires_supported_candidate(self):
        response = {
            "model": MODEL,
            "answers": {
                "candidate": {
                    "type": "choice",
                    "choice": "routing",
                    "confidence": 0.9,
                    "probabilities": {"routing": 0.9, "applications": 0.06, ABSTAIN: 0.04},
                },
                "sufficient": {"type": "noul", "noul": 0.85},
            },
        }
        self.assertEqual(advisory(response)["candidate"], "routing")
        response["answers"]["sufficient"]["noul"] = 0.2
        self.assertEqual(advisory(response)["status"], "abstain")
        response["answers"]["candidate"].update(
            choice=ABSTAIN, probabilities={"routing": 0.04, "applications": 0.06, ABSTAIN: 0.9}
        )
        response["answers"]["sufficient"]["noul"] = 0.85
        self.assertEqual(advisory(response)["status"], "abstain")
        response["answers"]["candidate"]["choice"] = "unknown-ID"
        with self.assertRaises(ValueError):
            advisory(response)
        response["answers"]["candidate"]["choice"] = ABSTAIN
        response["answers"]["sufficient"]["noul"] = float("nan")
        with self.assertRaises(ValueError):
            advisory(response)


if __name__ == "__main__":
    unittest.main()
