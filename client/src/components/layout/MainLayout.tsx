import { useState } from "react";
import { Layout, Menu, theme, Button, Dropdown, message, Image } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  CalendarOutlined,
  SettingOutlined,
  LogoutOutlined,
  GroupOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import Link from "next/link";
import { authApi } from "@/services/api/auth";

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      localStorage.removeItem("token");
      message.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      message.error("Failed to logout");
    }
  };

  const userMenu = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Profile",
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        onClick: handleLogout,
      },
    ],
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <CalendarOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: "schedule",
      icon: <UserOutlined />,
      label: <Link href="/schedule">Schedule Management</Link>,
    },
    {
      key: "account",
      icon: <SettingOutlined />,
      label: "Account Management",
      children: [
        { key: 'student', label: <Link href="/account/student">Student Account</Link>, icon: <UserOutlined /> },
        { key: 'group', label: <Link href="/account/group">Group</Link>, icon: <GroupOutlined /> },
      ],  
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={"fit-content"}
      >
        <div
          style={{
            height: 32,
            margin: 16,
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {collapsed ? (
            <Link href="/dashboard">
              <Image src="/logo.png" alt="logo" width={32} height={32} />
            </Link>
          ) : (
            <Link href="/dashboard">Calender App</Link>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[router.pathname.split("/")[1] || "dashboard"]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 16px",
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button icon={<UserOutlined />}>{"User"}</Button>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
