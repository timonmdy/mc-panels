<?php

namespace Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft;

use Pterodactyl\BlueprintFramework\Extensions\mcpanels\Minecraft\TpsReaders\TpsReader;
use RuntimeException;

final class TpsReaderRegistry
{
    private static ?array $readers = null;

    public static function options(): array
    {
        $options = [];
        foreach (self::all() as $key => $reader) {
            $command = $reader->command();
            $options[$key] = $command === '' ? $reader->label() : $reader->label() . ' — ' . $command;
        }

        return $options;
    }

    public static function get(string $key): TpsReader
    {
        $reader = self::all()[$key] ?? null;
        if (!$reader instanceof TpsReader) {
            throw new RuntimeException("TPS reader \"{$key}\" is not registered.");
        }

        return $reader;
    }

    private static function all(): array
    {
        if (self::$readers !== null) {
            return self::$readers;
        }

        require_once __DIR__ . '/TpsReaders/TpsReader.php';
        require_once __DIR__ . '/TpsReaders/TpsReading.php';

        $readers = [];
        foreach (glob(__DIR__ . '/TpsReaders/*Format.php') ?: [] as $file) {
            $class = __NAMESPACE__ . '\\TpsReaders\\' . basename($file, '.php');
            require_once $file;
            $reader = new $class();
            if (!$reader instanceof TpsReader) {
                throw new RuntimeException("TPS format class {$class} must implement TpsReader.");
            }
            $key = $reader->key();
            if ($key === '' || isset($readers[$key])) {
                throw new RuntimeException("TPS reader key \"{$key}\" is empty or duplicated.");
            }
            $readers[$key] = $reader;
        }
        ksort($readers);

        return self::$readers = $readers;
    }
}
