// Interfaces separadas para uso seguro no client e server

export interface ContainerInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  ports: Array<{
    IP: string;
    PrivatePort: number;
    PublicPort: number;
    Type: string;
  }>;
  created: Date;
  state: string;
  labels: Record<string, string>;
}

export interface ServiceInfo {
  id: string;
  name: string;
  image: string;
  status: string;
  ports: string[];
  environment: Record<string, string>;
  volumes: string[];
  networks: string[];
}
