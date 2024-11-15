# ArgoCD Clusters Controller

### Proof of Concept (PoC): Kubernetes Controller designed to manage ArgoCD clusters based on data from AWS Secret Manager.


Controller scan available secrets in AWS Secret Manager ang created/update/delete appropriate secrets in Kubernetes [ArgoCD Declarative Setup](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#clusters)


AWS Secrets scanned by name prefix and each secret should contain valid JSON:

```JSON
{
    "name": "docker-desktop",
    "server": "https://kubernetes.docker.internal:6443",
    "labels": {
      "environment": "production"
    },
    "config": {
        "bearerToken": "LS0tLS ... QVRFLS0tLS0K",
        "tlsClientConfig": {
            "insecure": false,
            "caData": "LS0tLS1CR ... 0FURS0tLS0tCg=="
        }
    }
}
```
