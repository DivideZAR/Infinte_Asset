import os
import json
import re
import argparse
from typing import Dict, List, Set

class CodebaseAnalyzer:
    def __init__(self, root_dir: str):
        self.root_dir = os.path.abspath(root_dir)
        self.ignore_dirs = {'.git', 'node_modules', 'dist', 'build', 'coverage', '.gemini'}
        self.stats = {
            "files_by_type": {},
            "total_files": 0
        }
        self.dependencies = {}
        self.scripts = {}
        self.entry_points = []

    def analyze(self):
        """Main analysis loop."""
        print(f"Analyzing codebase at: {self.root_dir}...")
        
        self._read_package_json()
        self._scan_files()
        
        report = self._generate_report()
        return report

    def _read_package_json(self):
        """Reads package.json for metadata."""
        pkg_path = os.path.join(self.root_dir, 'package.json')
        if os.path.exists(pkg_path):
            try:
                with open(pkg_path, 'r') as f:
                    data = json.load(f)
                    self.dependencies = {**data.get('dependencies', {}), **data.get('devDependencies', {})}
                    self.scripts = data.get('scripts', {})
            except Exception as e:
                print(f"Error reading package.json: {e}")

    def _scan_files(self):
        """Walks the directory and collects file stats."""
        for root, dirs, files in os.walk(self.root_dir):
            # Modify dirs in-place to skip ignored directories
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            
            for file in files:
                ext = os.path.splitext(file)[1]
                self.stats["total_files"] += 1
                self.stats["files_by_type"][ext] = self.stats["files_by_type"].get(ext, 0) + 1
                
                # specific checks for interesting files
                if file in ['index.ts', 'index.js', 'index.jsx', 'main.ts', 'server.ts']:
                    rel_path = os.path.relpath(os.path.join(root, file), self.root_dir)
                    self.entry_points.append(rel_path)

    def _generate_report(self) -> str:
        """Generates a markdown report."""
        report = []
        report.append("# Codebase Analysis Report\n")
        
        report.append("## Project Structure")
        report.append(f"- **Root**: `{self.root_dir}`")
        report.append(f"- **Total Files**: {self.stats['total_files']}")
        report.append("\n**File Types:**")
        for ext, count in sorted(self.stats["files_by_type"].items(), key=lambda x: -x[1]):
            report.append(f"- `{ext}`: {count}")
            
        report.append("\n## Key Configurations")
        if self.scripts:
            report.append("**NPM Scripts:**")
            for name, cmd in self.scripts.items():
                report.append(f"- `{name}`: `{cmd}`")
        else:
            report.append("No NPM scripts found.")

        report.append("\n## Dependencies")
        if self.dependencies:
            report.append(f"Found {len(self.dependencies)} dependencies. Top 5:")
            for dep in list(self.dependencies.keys())[:5]:
                report.append(f"- {dep}")
        else:
            report.append("No dependencies found.")
            
        report.append("\n## Potential Entry Points")
        if self.entry_points:
            for ep in self.entry_points:
                report.append(f"- `{ep}`")
        else:
            report.append("No standard entry points (index/main) found.")

        return "\n".join(report)

if __name__ == "__main__":
    analyzer = CodebaseAnalyzer(".")
    report = analyzer.analyze()
    print("\n" + "="*30 + "\n")
    print(report)
    
    # Optionally save to file
    with open("codebase_report.md", "w") as f:
        f.write(report)
    print("\nReport saved to codebase_report.md")
