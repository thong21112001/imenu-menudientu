'use client';

import React, { useState, useEffect } from 'react';
import { storageService } from '@imenu/utils';
import { User } from '@imenu/types';
import { Card, Button, Badge } from '@imenu/ui';
import { Users, UserPlus, Shield } from 'lucide-react';

export default function StaffPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(storageService.getUsers());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#09271d]">Nhân Viên & Phân Quyền (RBAC)</h1>
          <p className="text-xs text-[#66736d] mt-0.5">
            Phân quyền 5 cấp: Quản trị chuỗi, Chủ nhà hàng, Quản lý ca, Thu ngân và Bếp
          </p>
        </div>

        <Button variant="primary" icon={<UserPlus className="w-4 h-4" />}>
          Thêm nhân viên mới
        </Button>
      </div>

      <div className="space-y-3">
        {users.map((usr) => (
          <Card key={usr.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#124a36] text-white font-bold grid place-items-center text-sm">
                {usr.fullName.charAt(0)}
              </div>
              <div>
                <strong className="text-sm text-slate-900 block">{usr.fullName}</strong>
                <span className="text-xs text-slate-500">{usr.email} · {usr.phone}</span>
              </div>
            </div>

            <Badge variant="brand">{usr.role}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
