<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Services;

use Pterodactyl\Models\Server;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;

class ServerFiles
{
    public function __construct(private DaemonFileRepository $files)
    {
    }

    public function read(Server $server, string $path, int $maxBytes = 1048576): ?string
    {
        try {
            return $this->files->setServer($server)->getContent($path, $maxBytes);
        } catch (\Throwable) {
            return null;
        }
    }

    public function write(Server $server, string $path, string $content): void
    {
        $this->files->setServer($server)->putContent($path, $content);
    }

    public function json(Server $server, string $path): array
    {
        $decoded = json_decode((string) $this->read($server, $path), true);

        return is_array($decoded) ? $decoded : [];
    }

    public function directory(Server $server, string $path): array
    {
        try {
            return $this->files->setServer($server)->getDirectory($path);
        } catch (\Throwable) {
            return [];
        }
    }

    public function lines(Server $server, string $path, int $maxBytes): ?array
    {
        $content = $this->read($server, $path, $maxBytes);

        return $content === null ? null : preg_split('/\r?\n/', $content);
    }
}
