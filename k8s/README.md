# NEURA | IANUSTEC AI Node - Kubernetes Deployment

Configurazione Kubernetes per l'installazione automatica del nodo n8n **NEURA | IANUSTEC AI** nel namespace `lair`.

## 📋 Overview

Questo deployment crea un **Job Kubernetes** che:

1. ⏳ **Aspetta** che n8n sia completamente pronto e funzionante
2. 📦 **Installa** automaticamente il Community Node `n8n-nodes-neura-ianustec`
3. ✅ **Verifica** l'installazione e fornisce istruzioni per l'uso

## 🏗️ Architettura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Namespace     │    │   ServiceAccount │    │   ConfigMap     │
│     lair        │    │ n8n-node-installer│    │ install-script  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                    ┌──────────────────────┐
                    │        Job           │
                    │ n8n-neura-ianustec-  │
                    │   node-installer     │
                    └──────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            ┌──────────────┐    ┌──────────────────┐
            │ Init Container│    │ Main Container   │
            │ wait-for-n8n │    │ node-installer   │
            └──────────────┘    └──────────────────┘
```

## 📁 File Structure

```
k8s/
├── namespace.yaml    # Namespace, ServiceAccount, RBAC
├── configmap.yaml    # Script di installazione
├── job.yaml         # Job principale
├── deploy.sh        # Script di deployment automatico
└── README.md        # Questa documentazione
```

## 🚀 Quick Start

### Deployment Automatico

```bash
# Deploy tutto con un comando (credenziali in plain text)
./k8s/deploy.sh

# Deploy con Secret per credenziali sicure
USE_SECRET=true ./k8s/deploy.sh

# Con opzioni personalizzate
NAMESPACE=lair WAIT_FOR_COMPLETION=true ./k8s/deploy.sh

# Dry run per testare
DRY_RUN=true ./k8s/deploy.sh
```

### Deployment Manuale

```bash
# 1. Applica namespace e RBAC
kubectl apply -f k8s/namespace.yaml

# 2. Applica ConfigMap con script
kubectl apply -f k8s/configmap.yaml

# 3a. (Opzionale) Applica Secret per credenziali sicure
kubectl apply -f k8s/secret.yaml

# 3b. Avvia il job (normale o con secret)
kubectl apply -f k8s/job.yaml
# OPPURE per versione con secret:
kubectl apply -f k8s/job-with-secret.yaml
```

## 🔧 Configurazione

### Variabili d'Ambiente

Il job può essere configurato tramite variabili d'ambiente nel file `job.yaml`:

| Variabile | Default | Descrizione |
|-----------|---------|-------------|
| `N8N_SERVICE_NAME` | `n8n` | Nome del service n8n |
| `N8N_NAMESPACE` | `lair` | Namespace di n8n |
| `N8N_PORT` | `5678` | Porta del service n8n |
| `MAX_WAIT_TIME` | `300` | Timeout massimo in secondi |
| `CHECK_INTERVAL` | `10` | Intervallo di controllo in secondi |
| `NODE_PACKAGE` | `n8n-nodes-neura-ianustec` | Nome del pacchetto npm |
| `NODE_VERSION` | `0.1.0` | Versione del pacchetto |
| `NEURA_BASE_URL` | `http://llm-neura-service.llm-neura.svc.cluster.local/v1` | URL del servizio NEURA interno |
| `NEURA_API_KEY` | `aa3cd3ec...` | API Key per il servizio NEURA |

### Script di Deployment

Lo script `deploy.sh` supporta le seguenti variabili:

| Variabile | Default | Descrizione |
|-----------|---------|-------------|
| `NAMESPACE` | `lair` | Namespace target |
| `KUBECTL_CONTEXT` | - | Contesto kubectl da usare |
| `DRY_RUN` | `false` | Modalità dry-run |
| `WAIT_FOR_COMPLETION` | `true` | Aspetta completamento job |
| `USE_SECRET` | `false` | Usa Secret per credenziali sicure |

## 📊 Monitoraggio

### Stato del Job

```bash
# Visualizza tutti i job nel namespace
kubectl get jobs -n lair

# Dettagli del job specifico
kubectl describe job n8n-neura-ianustec-node-installer -n lair

# Stato dei pod
kubectl get pods -n lair -l app.kubernetes.io/name=n8n-node-installer
```

### Log del Job

```bash
# Log in tempo reale
kubectl logs -f job/n8n-neura-ianustec-node-installer -n lair

# Log di tutti i container
kubectl logs job/n8n-neura-ianustec-node-installer -n lair --all-containers=true

# Log dell'init container
kubectl logs job/n8n-neura-ianustec-node-installer -n lair -c wait-for-n8n
```

### Debug

```bash
# Eventi del namespace
kubectl get events -n lair --sort-by='.lastTimestamp'

# Descrizione completa del job
kubectl describe job n8n-neura-ianustec-node-installer -n lair

# Shell nel pod (se ancora in esecuzione)
kubectl exec -it <pod-name> -n lair -- /bin/sh
```

## 🔄 Workflow di Esecuzione

1. **Init Container** (`wait-for-n8n`):
   - Controlla che il deployment/statefulset n8n sia ready
   - Verifica l'endpoint `/healthz` di n8n
   - Aspetta fino a timeout o successo

2. **Main Container** (`node-installer`):
   - Installa il pacchetto npm `n8n-nodes-neura-ianustec`
   - Verifica l'installazione
   - Opzionalmente copia i file se volume condiviso disponibile
   - Fornisce istruzioni per l'uso

## ⚙️ Personalizzazione

### Modifica del Service n8n

Se il tuo n8n ha un nome diverso, modifica in `job.yaml`:

```yaml
env:
- name: N8N_SERVICE_NAME
  value: "my-n8n-service"  # Cambia qui
```

### Volume Condiviso (Opzionale)

Per copiare automaticamente i file del nodo, decommentare in `job.yaml`:

```yaml
env:
- name: N8N_NODES_PATH
  value: "/n8n/nodes"

volumeMounts:
- name: n8n-nodes
  mountPath: /n8n/nodes

volumes:
- name: n8n-nodes
  persistentVolumeClaim:
    claimName: n8n-nodes-pvc
```

### Timeout e Retry

Modifica i timeout in `job.yaml`:

```yaml
env:
- name: MAX_WAIT_TIME
  value: "600"  # 10 minuti
- name: CHECK_INTERVAL
  value: "15"   # Controlla ogni 15s

spec:
  backoffLimit: 5  # Riprova fino a 5 volte
```

## 🚨 Troubleshooting

### Job Fallisce

1. **Controlla i log**:
   ```bash
   kubectl logs job/n8n-neura-ianustec-node-installer -n lair
   ```

2. **Verifica n8n**:
   ```bash
   kubectl get pods -n lair -l app.kubernetes.io/name=n8n
   kubectl logs -l app.kubernetes.io/name=n8n -n lair
   ```

3. **Controlla la connettività**:
   ```bash
   kubectl run test-curl --rm -i --tty --image=curlimages/curl -- \
     curl -v http://n8n.lair.svc.cluster.local:5678/healthz
   ```

### Timeout

Se il job va in timeout:

1. Aumenta `MAX_WAIT_TIME`
2. Controlla che n8n sia effettivamente pronto
3. Verifica la configurazione del service

### Permessi

Se ci sono errori di permessi:

1. Controlla il ServiceAccount e RBAC
2. Verifica che il namespace esista
3. Controlla i security context

## 🔄 Cleanup

### Rimuovere il Job

```bash
# Rimuove solo il job
kubectl delete job n8n-neura-ianustec-node-installer -n lair

# Rimuove tutto
kubectl delete -f k8s/
```

### Cleanup Automatico

Il job è configurato con `ttlSecondsAfterFinished: 86400` (24 ore) per la pulizia automatica.

## 📚 Riferimenti

- [Kubernetes Jobs](https://kubernetes.io/docs/concepts/workloads/controllers/job/)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
- [NEURA | IANUSTEC AI Node](https://github.com/ianustec/n8n-nodes-neura-ianustec)

## 🆘 Support

Per problemi o domande:

- **Issues**: [GitHub Issues](https://github.com/ianustec/n8n-nodes-neura-ianustec/issues)
- **Documentation**: [Repository README](../README.md)
- **Community**: [n8n Community](https://community.n8n.io)
