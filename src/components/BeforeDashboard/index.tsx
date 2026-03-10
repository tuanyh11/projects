import configPromise from '@payload-config';
import { getPayload } from 'payload';
import './index.scss';
import { OrderChart } from './OrderChart';

export const BeforeDashboard = async () => {
  const payload = await getPayload({ config: configPromise })

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { docs: orders } = await payload.find({
    collection: 'orders',
    limit: 1000,
    where: {
      createdAt: {
        greater_than_equal: sevenDaysAgo.toISOString(),
      },
    },
    depth: 0,
  })

  return (
    <div className="before-dashboard">
      {/* Welcome */}
      <div className="welcome-card">
        <div className="welcome-card__left">
          <span className="welcome-card__icon">🍃</span>
          <div>
            <h2 className="welcome-card__title">Hồng Thái Admin</h2>
            <p className="welcome-card__desc">Quản trị du lịch, homestay và đặc sản vùng cao.</p>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="quick-links">
        {[
          { icon: '📍', label: 'Điểm đến', link: '/admin/collections/destinations', count: '' },
          { icon: '🏡', label: 'Phòng', link: '/admin/collections/rooms', count: '' },
          { icon: '📦', label: 'Sản phẩm', link: '/admin/collections/products', count: '' },
          { icon: '👥', label: 'Người dùng', link: '/admin/collections/users', count: '' },
        ].map((item, i) => (
          <a key={i} href={item.link} className="quick-link">
            <span className="quick-link__icon">{item.icon}</span>
            <span className="quick-link__label">{item.label}</span>
            <span className="quick-link__arrow">→</span>
          </a>
        ))}
      </div>

      <OrderChart orders={orders} />
    </div>
  )
}
