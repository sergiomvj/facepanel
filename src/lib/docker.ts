import Docker from 'dockerode';

// Initialize Docker client
const docker = new Docker({
  socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock'
});

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

export class DockerService {
  private docker: Docker;

  constructor() {
    this.docker = docker;
  }

  // Get all containers (running and stopped)
  async getAllContainers(): Promise<ContainerInfo[]> {
    try {
      const containers = await this.docker.listContainers({ all: true });
      
      return containers.map(container => ({
        id: container.Id,
        name: container.Names[0].replace(/^\//, ''),
        image: container.Image,
        status: container.Status,
        ports: container.Ports || [],
        created: new Date(container.Created * 1000),
        state: container.State,
        labels: container.Labels || {}
      }));
    } catch (error) {
      console.error('Error fetching containers:', error);
      throw new Error('Failed to fetch containers');
    }
  }

  // Get container by ID
  async getContainer(id: string) {
    try {
      const container = this.docker.getContainer(id);
      const info = await container.inspect();
      return info;
    } catch (error) {
      console.error('Error fetching container:', error);
      throw new Error('Failed to fetch container');
    }
  }

  // Start container
  async startContainer(id: string): Promise<void> {
    try {
      const container = this.docker.getContainer(id);
      await container.start();
    } catch (error) {
      console.error('Error starting container:', error);
      throw new Error('Failed to start container');
    }
  }

  // Stop container
  async stopContainer(id: string): Promise<void> {
    try {
      const container = this.docker.getContainer(id);
      await container.stop();
    } catch (error) {
      console.error('Error stopping container:', error);
      throw new Error('Failed to stop container');
    }
  }

  // Restart container
  async restartContainer(id: string): Promise<void> {
    try {
      const container = this.docker.getContainer(id);
      await container.restart();
    } catch (error) {
      console.error('Error restarting container:', error);
      throw new Error('Failed to restart container');
    }
  }

  // Remove container
  async removeContainer(id: string): Promise<void> {
    try {
      const container = this.docker.getContainer(id);
      await container.remove({ force: true });
    } catch (error) {
      console.error('Error removing container:', error);
      throw new Error('Failed to remove container');
    }
  }

  // Create container from image
  async createContainer(config: any): Promise<string> {
    try {
      const container = await this.docker.createContainer(config);
      return container.id;
    } catch (error) {
      console.error('Error creating container:', error);
      throw new Error('Failed to create container');
    }
  }

  // Execute command in container
  async execCommand(containerId: string, command: string[]): Promise<{ output: string; exitCode: number }> {
    try {
      const container = this.docker.getContainer(containerId);
      
      // Create exec instance
      const exec = await container.exec({
        Cmd: command,
        AttachStdout: true,
        AttachStderr: true,
        Tty: false
      });

      // Start exec
      const stream = await exec.start({ hijack: true, stdin: false });
      
      let output = '';
      
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => {
          output += chunk.toString();
        });

        stream.on('end', async () => {
          try {
            const inspect = await exec.inspect();
            resolve({
              output,
              exitCode: inspect.ExitCode || 0
            });
          } catch (error) {
            reject(error);
          }
        });

        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Error executing command:', error);
      throw new Error('Failed to execute command');
    }
  }

  // Get container logs
  async getContainerLogs(containerId: string, options: any = {}): Promise<string> {
    try {
      const container = this.docker.getContainer(containerId);
      const stream = await container.logs({
        stdout: true,
        stderr: true,
        tail: options.tail || 100,
        timestamps: options.timestamps || false,
        follow: options.follow || false
      });

      return new Promise((resolve, reject) => {
        let logs = '';
        
        stream.on('data', (chunk) => {
          logs += chunk.toString();
        });

        stream.on('end', () => {
          resolve(logs);
        });

        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Error fetching container logs:', error);
      throw new Error('Failed to fetch container logs');
    }
  }

  // Stream container logs
  async streamContainerLogs(containerId: string, callback: (data: string) => void): Promise<void> {
    try {
      const container = this.docker.getContainer(containerId);
      const stream = await container.logs({
        stdout: true,
        stderr: true,
        follow: true,
        timestamps: true
      });

      stream.on('data', (chunk) => {
        callback(chunk.toString());
      });

      stream.on('error', (error) => {
        console.error('Error streaming logs:', error);
        callback(`Error: ${error.message}`);
      });
    } catch (error) {
      console.error('Error setting up log stream:', error);
      throw new Error('Failed to stream container logs');
    }
  }

  // Get container stats
  async getContainerStats(containerId: string): Promise<any> {
    try {
      const container = this.docker.getContainer(containerId);
      const stats = await container.stats({ stream: false });
      return stats;
    } catch (error) {
      console.error('Error fetching container stats:', error);
      throw new Error('Failed to fetch container stats');
    }
  }

  // Get all images
  async getImages(): Promise<any[]> {
    try {
      const images = await this.docker.listImages();
      return images;
    } catch (error) {
      console.error('Error fetching images:', error);
      throw new Error('Failed to fetch images');
    }
  }

  // Pull image
  async pullImage(imageName: string, callback?: (progress: any) => void): Promise<void> {
    try {
      await new Promise((resolve, reject) => {
        this.docker.pull(imageName, (err: any, stream: any) => {
          if (err) return reject(err);
          
          this.docker.modem.followProgress(stream, (err: any, output: any) => {
            if (err) return reject(err);
            resolve(output);
          }, (event: any) => {
            if (callback) callback(event);
          });
        });
      });
    } catch (error) {
      console.error('Error pulling image:', error);
      throw new Error('Failed to pull image');
    }
  }

  // Get system info
  async getSystemInfo(): Promise<any> {
    try {
      const info = await this.docker.info();
      return info;
    } catch (error) {
      console.error('Error fetching system info:', error);
      throw new Error('Failed to fetch system info');
    }
  }

  // Get Docker version
  async getDockerVersion(): Promise<any> {
    try {
      const version = await this.docker.version();
      return version;
    } catch (error) {
      console.error('Error fetching Docker version:', error);
      throw new Error('Failed to fetch Docker version');
    }
  }
}

// Export singleton instance
export const dockerService = new DockerService();