<?php
/**
 * JSON Data Store
 *
 * Simple file-based storage that reads/writes JSON files in /data.
 * Drop-in replacement for a database — same data, zero setup.
 *
 * Usage:
 *   $store = new JsonStore('routes');         // loads data/routes.json
 *   $all   = $store->all();                   // get all records
 *   $one   = $store->find('id', 'route-001'); // find by field
 *   $store->append($newRecord);               // add a record & save
 */

class JsonStore
{
    private string $filePath;
    private array  $data;

    public function __construct(string $name)
    {
        $this->filePath = DATA_DIR . "/{$name}.json";

        if (!file_exists($this->filePath)) {
            $this->data = [];
            return;
        }

        $raw = file_get_contents($this->filePath);
        $this->data = json_decode($raw, true) ?? [];
    }

    /** Get all records. */
    public function all(): array
    {
        return $this->data;
    }

    /** Find the first record where $field === $value. */
    public function find(string $field, mixed $value): ?array
    {
        foreach ($this->data as $row) {
            if (isset($row[$field]) && $row[$field] == $value) {
                return $row;
            }
        }
        return null;
    }

    /** Filter records by a callback. */
    public function filter(callable $fn): array
    {
        return array_values(array_filter($this->data, $fn));
    }

    /** Search records — returns rows where ANY of the given fields contain $query (case-insensitive). */
    public function search(string $query, array $fields): array
    {
        $q = mb_strtolower($query);
        return array_values(array_filter($this->data, function ($row) use ($q, $fields) {
            foreach ($fields as $f) {
                if (isset($row[$f]) && str_contains(mb_strtolower((string) $row[$f]), $q)) {
                    return true;
                }
            }
            return false;
        }));
    }

    /** Append a record and save to disk. */
    public function append(array $record): void
    {
        $this->data[] = $record;
        $this->save();
    }

    /** Count records, optionally filtered. */
    public function count(?callable $fn = null): int
    {
        if ($fn) {
            return count(array_filter($this->data, $fn));
        }
        return count($this->data);
    }

    /** Paginate results. */
    public function paginate(array $records, int $page, int $perPage): array
    {
        $offset = ($page - 1) * $perPage;
        return array_slice($records, $offset, $perPage);
    }

    /** Save current data to disk. */
    private function save(): void
    {
        $dir = dirname($this->filePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents(
            $this->filePath,
            json_encode($this->data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            LOCK_EX
        );
    }
}
