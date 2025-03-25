import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import yaml

def calculate_active_maintenance_score(commits_last_30_days):
    return (commits_last_30_days / 100) * 10

def calculate_community_trust_score(stars, forks):
    return ((stars / 1000) + (forks / 500)) * 5

def calculate_code_health_score(coverage_percentage, open_issues):
    return coverage_percentage - (open_issues / 100)

def calculate_ci_cd_efficiency_score(build_pass_rate, average_deploy_time):
    return (build_pass_rate * 0.1) + (2 if average_deploy_time < 5 else 0)

def calculate_cost_efficiency_score(cost, max_budget):
    return (1 - (cost / max_budget)) * 10

def calculate_component_score(quality_score, impact_value, weight):
    return quality_score * impact_value * weight

def calculate_total_ci_cd_score(component_scores):
    return sum(component_scores)

def calculate_roi(ci_cd_value_score, monthly_cost):
    return (ci_cd_value_score * 1000) / monthly_cost

def generate_visualization(report_data, output_path='ci_cd_value_plot.png'):
    labels = report_data.keys()
    values = report_data.values()
    plt.figure(figsize=(10, 6))
    plt.bar(labels, values, color=['blue', 'green', 'red', 'purple'])
    plt.title('CI/CD Pipeline Value Assessment')
    plt.ylabel('Value ($)')
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(output_path)
    plt.close()

def main():
    with open('config/ci_cd_metrics.yaml', 'r') as f:
        config = yaml.safe_load(f)
    
    active_maintenance_score = calculate_active_maintenance_score(config['commits_last_30_days'])
    community_trust_score = calculate_community_trust_score(config['stars'], config['forks'])
    code_health_score = calculate_code_health_score(config['coverage_percentage'], config['open_issues'])
    ci_cd_efficiency_score = calculate_ci_cd_efficiency_score(config['build_pass_rate'], config['average_deploy_time'])
    cost_efficiency_score = calculate_cost_efficiency_score(config['cost'], config['max_budget'])

    component_scores = [
        calculate_component_score(config['branch_strategy_score'], 0.15, config['branch_strategy_weight']),
        calculate_component_score(config['test_automation_score'], 0.25, config['test_automation_weight']),
        calculate_component_score(config['containerization_score'], 0.2, config['containerization_weight']),
        calculate_component_score(config['monitoring_score'], 0.18, config['monitoring_weight']),
    ]

    total_ci_cd_score = calculate_total_ci_cd_score(component_scores)
    roi = calculate_roi(total_ci_cd_score, config['monthly_cost'])

    report = {
        'Active Maintenance Score': active_maintenance_score,
        'Community Trust Score': community_trust_score,
        'Code Health Score': code_health_score,
        'CI/CD Efficiency Score': ci_cd_efficiency_score,
        'Cost Efficiency Score': cost_efficiency_score,
        'Total CI/CD Score': total_ci_cd_score,
        'ROI': roi
    }
    
    with open('ci_cd_value_report.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    generate_visualization(report)

if __name__ == "__main__":
    main()
