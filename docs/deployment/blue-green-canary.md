# Blue-Green and Canary Deployments

Reduce risk by gradually rolling out changes or switching traffic between two environments.

## Blue-Green

- Maintain two production environments: Blue (current) and Green (new).
- Deploy new version to Green, run smoke/e2e tests, then switch traffic to Green.
- Keep Blue available for fast rollback.

## Canary

- Gradually shift traffic percentage to the new version while monitoring KPIs (error rate, p95 latency).
- Roll back automatically on SLO/SLA breach.

## Next.js Hosting Notes

- Vercel: each deployment gets a unique URL; promote a deployment to production, or use Traffic Splitting (Enterprise) for canaries.
- Self-hosted/containers: use a load balancer or service mesh to shift traffic between versions.

## Monitoring

- Use Sentry alerts and uptime monitors during rollout.
- Track release health to detect regressions early.
