<?php

namespace App\Repositories\Contracts;

interface AccountRepositoryInterface
{
    public function all();
    public function find(int $id);
    public function findByCode(string $code);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id);
    public function getByType(string $type);
    public function getByCategory(string $category);
    public function getActiveAccounts();
    public function getAccountsWithBalance();
}
