import React, { useState } from 'react'
import { CheckCircle2, Clock3, XCircle } from 'lucide-react'
import { formatVnd } from '../utils/format.js'
import { orderApi } from '../services/api.js'
import type { Order } from '../types/index.js'

interface OrdersProps {
  orders: Order[]
  onNavigate: (page: string) => void
  onOrderUpdated: () => void
  flash: (msg: string) => void
}

export function Orders({
  orders,
  onNavigate,
  onOrderUpdated,
  flash,
}: OrdersProps) {
  const [orderFilter, setOrderFilter] = useState('Tất cả')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const filteredOrders =
    orderFilter === 'Tất cả'
      ? orders
      : orders.filter((order) => order.status === orderFilter)

  const handleCancel = async (id: string) => {
    setCancellingId(id)
    try {
      await orderApi.cancelOrder(id)
      flash('Đã hủy lệnh thành công!')
      onOrderUpdated()
    } catch (err) {
      flash((err as Error).message || 'Không thể hủy lệnh')
    } finally {
      setCancellingId(null)
    }
  }

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '--:--'
    const date = new Date(dateStr)
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <section className="page-content">
      <div className="page-tools">
        <div className="filter-pills">
          {['Tất cả', 'Chờ khớp', 'Đã khớp', 'Đã hủy'].map((filter) => (
            <button
              key={filter}
              onClick={() => setOrderFilter(filter)}
              className={orderFilter === filter ? 'active' : ''}
            >
              {filter}
              {filter === 'Tất cả' && <span>{orders.length}</span>}
            </button>
          ))}
        </div>
        <button
          onClick={() => onNavigate('Giao dịch')}
          className="primary-action"
        >
          + Đặt lệnh mới
        </button>
      </div>

      <div className="panel data-card">
        <div className="section-title">
          <div>
            <b>Lịch sử lệnh</b>
            <small>Đồng bộ thời gian thực từ MongoDB</small>
          </div>
          <Clock3 size={18} />
        </div>

        <div className="data-table order-table">
          <div className="table-row table-head">
            <span>MÃ LỆNH</span>
            <span>THỜI GIAN</span>
            <span>MÃ CK</span>
            <span>LOẠI LỆNH</span>
            <span>KHỐI LƯỢNG</span>
            <span>GIÁ ĐẶT</span>
            <span>TRẠNG THÁI</span>
          </div>

          {filteredOrders.map((order) => (
            <div className="table-row" key={order._id || order.orderCode}>
              <span>{order.orderCode}</span>
              <span>{formatTime(order.createdAt)}</span>
              <span>
                <b>{order.symbol}</b>
              </span>
              <span className={order.side === 'Mua' ? 'positive' : 'negative'}>
                {order.side} ({order.orderType || 'LO'})
              </span>
              <span>{formatVnd(order.quantity)}</span>
              <span>{formatVnd(order.price)}</span>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  className={`status-chip ${
                    order.status === 'Đã khớp'
                      ? 'done'
                      : order.status === 'Chờ khớp'
                        ? 'pending'
                        : 'cancelled'
                  }`}
                >
                  {order.status === 'Đã khớp' ? (
                    <CheckCircle2 size={13} />
                  ) : order.status === 'Chờ khớp' ? (
                    <Clock3 size={13} />
                  ) : (
                    <XCircle size={13} />
                  )}
                  {order.status}
                </span>

                {order.status === 'Chờ khớp' && (
                  <button
                    onClick={() => handleCancel(order._id)}
                    disabled={cancellingId === order._id}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid #7d2a30',
                      background: '#341518',
                      color: '#ff858d',
                      fontSize: '9px',
                      cursor: 'pointer',
                    }}
                  >
                    {cancellingId === order._id ? 'Đang hủy...' : 'Hủy'}
                  </button>
                )}
              </span>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="empty-row">Không có lệnh phù hợp với bộ lọc.</div>
          )}
        </div>
      </div>
    </section>
  )
}

