<?php

namespace App\Repositories\Contracts;

interface ExpenseRepositoryInterface
{
    public function all();
    public function find(int $id);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id);
    public function getWithFilters(array $filters = []);
    public function getByCategory(string $category);
    public function getByDateRange($from, $to);
    public function getTotalByCategory(string $category, $from = null, $to = null);
}
