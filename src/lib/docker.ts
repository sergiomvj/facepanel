import Docker from 'dockerode';
import os from 'os';

class DockerService {
  private docker: Docker;

  constructor() {
    const socketPath = os.platform() === 'win32' ? '//./pipe/docker_engine' : '/var/run/docker.sock';
    this.docker = new Docker({ socketPath });
    this.checkDockerClient();
  }

  private checkDockerClient() {
    if (!this.docker) {
      throw new Error('Docker client is not initialized.');
    }
  }

  async getContainers() {
    this.checkDockerClient();
    try {
      const containers = await this.docker.listContainers({ all: true });
      return containers.map(container => ({
        id: container.Id,
        name: container.Names[0]?.replace(/^\//, '') || container.Id.substring(0, 12),
        image: container.Image,
        status: container.Status,
        state: container.State,
      }));
    } catch (error) {
      console.error('Error fetching containers:', error);
      throw new Error(`Failed to fetch containers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getContainer(id: string) {
    this.checkDockerClient();
    try {
      const container = this.docker.getContainer(id);
      return await container.inspect();
    } catch (error) {
      console.error(`Error fetching container ${id}:`, error);
      throw new Error(`Failed to fetch container ${id}.`);
    }
  }

  async getContainerLogs(containerId: string, options: { tail?: number, timestamps?: boolean } = {}) {
    this.checkDockerClient();
    try {
      const container = this.docker.getContainer(containerId);
      const logStream = await container.logs({
        stdout: true,
        stderr: true,
        follow: false,
        tail: options.tail || 100,
        timestamps: options.timestamps || false,
      });
      return logStream.toString();
    } catch (error) {
      console.error(`Error fetching logs for container ${containerId}:`, error);
      throw new Error(`Failed to fetch logs for container ${containerId}.`);
    }
  }
}

export const dockerService = new DockerService();
