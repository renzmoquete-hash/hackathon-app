<?php
/**
 * Input Validator
 * 
 * Validates and sanitises request data before it reaches the database.
 */

class Validator
{
    private array $errors = [];

    /**
     * Require a field to be present and non-empty.
     */
    public function required(array $data, string $field, string $label = ''): self
    {
        $label = $label ?: $field;
        if (!isset($data[$field]) || trim((string) $data[$field]) === '') {
            $this->errors[$field] = "{$label} is required.";
        }
        return $this;
    }

    /**
     * Validate that a field is a positive integer.
     */
    public function positiveInt(array $data, string $field, string $label = ''): self
    {
        $label = $label ?: $field;
        if (isset($data[$field]) && trim((string) $data[$field]) !== '') {
            $val = filter_var($data[$field], FILTER_VALIDATE_INT);
            if ($val === false || $val < 1) {
                $this->errors[$field] = "{$label} must be a positive number.";
            }
        }
        return $this;
    }

    /**
     * Validate a field is within a set of allowed values.
     */
    public function inList(array $data, string $field, array $allowed, string $label = ''): self
    {
        $label = $label ?: $field;
        if (isset($data[$field]) && !in_array($data[$field], $allowed, true)) {
            $this->errors[$field] = "{$label} must be one of: " . implode(', ', $allowed) . '.';
        }
        return $this;
    }

    /**
     * Validate maximum string length.
     */
    public function maxLength(array $data, string $field, int $max, string $label = ''): self
    {
        $label = $label ?: $field;
        if (isset($data[$field]) && mb_strlen((string) $data[$field]) > $max) {
            $this->errors[$field] = "{$label} must not exceed {$max} characters.";
        }
        return $this;
    }

    /**
     * Check whether validation passed.
     */
    public function passes(): bool
    {
        return empty($this->errors);
    }

    /**
     * Get all validation errors.
     */
    public function errors(): array
    {
        return $this->errors;
    }

    /**
     * Sanitise a string for safe storage.
     */
    public static function sanitize(string $value): string
    {
        return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
    }
}
