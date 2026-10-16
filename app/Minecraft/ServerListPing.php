<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft;

class ServerListPing
{
    private const PROTOCOL = 765;

    public function query(string $host, int $port, int $timeout = 3): ?array
    {
        $socket = @fsockopen($host, $port, $errno, $error, $timeout);
        if (!$socket) {
            return null;
        }

        stream_set_timeout($socket, $timeout);
        $payload = "\x00" . $this->varInt(self::PROTOCOL) . $this->varInt(strlen($host)) . $host . pack('n', $port) . $this->varInt(1);
        fwrite($socket, $this->varInt(strlen($payload)) . $payload . "\x01\x00");

        $length = $this->readVarInt($socket);
        $this->readVarInt($socket);
        $jsonLength = $this->readVarInt($socket);

        $json = '';
        while ($length > 0 && strlen($json) < $jsonLength && !feof($socket)) {
            $chunk = fread($socket, $jsonLength - strlen($json));
            if ($chunk === false || $chunk === '') {
                break;
            }
            $json .= $chunk;
        }
        fclose($socket);

        $data = json_decode($json, true);

        return is_array($data) ? $data : null;
    }

    private function varInt(int $value): string
    {
        $out = '';
        do {
            $byte = $value & 0x7F;
            $value >>= 7;
            $out .= chr($value !== 0 ? $byte | 0x80 : $byte);
        } while ($value !== 0);

        return $out;
    }

    private function readVarInt($socket): int
    {
        $result = 0;
        for ($i = 0; $i < 5; $i++) {
            $char = fgetc($socket);
            if ($char === false) {
                return 0;
            }
            $byte = ord($char);
            $result |= ($byte & 0x7F) << (7 * $i);
            if (($byte & 0x80) === 0) {
                return $result;
            }
        }

        return 0;
    }
}
