'use client'

import Image from "next/image"
import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    company: {
      title: "Empresa",
      links: [
        { name: "Sobre Nós", href: "/sobre" },
        { name: "Carreiras", href: "/carreiras" },
        { name: "Imprensa", href: "/imprensa" },
        { name: "Blog", href: "/blog" }
      ]
    },
    support: {
      title: "Suporte",
      links: [
        { name: "Central de Ajuda", href: "/ajuda" },
        { name: "Contato", href: "/contato" },
        { name: "Status da Plataforma", href: "/status" },
        { name: "Reportar Problema", href: "/reportar" }
      ]
    },
    legal: {
      title: "Legal",
      links: [
        { name: "Termos de Uso", href: "/termos" },
        { name: "Política de Privacidade", href: "/privacidade" },
        { name: "Cookies", href: "/cookies" },
        { name: "LGPD", href: "/lgpd" }
      ]
    },
    content: {
      title: "Conteúdo",
      links: [
        { name: "Catálogo", href: "/catalogo" },
        { name: "Lançamentos", href: "/lancamentos" },
        { name: "Mais Assistidos", href: "/populares" },
        { name: "Gêneros", href: "/generos" }
      ]
    }
  }

  const socialLinks = [
    {
      name: "Twitter/X",
      href: "https://twitter.com",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: "Instagram",
      href: "https://instagram.com",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12.017 0C8.396 0 7.929.013 6.71.072 5.493.131 4.73.333 4.058.63c-.68.3-1.18.66-1.73 1.2-.55.55-.9 1.05-1.2 1.73-.3.68-.5 1.44-.56 2.66C.013 7.929 0 8.396 0 12.017s.013 4.088.072 5.307c.06 1.22.26 1.98.56 2.66.3.68.65 1.18 1.2 1.73.55.55 1.05.9 1.73 1.2.68.3 1.44.5 2.66.56 1.219.059 1.686.072 5.307.072s4.088-.013 5.307-.072c1.22-.06 1.98-.26 2.66-.56.68-.3 1.18-.65 1.73-1.2.55-.55.9-1.05 1.2-1.73.3-.68.5-1.44.56-2.66.059-1.219.072-1.686.072-5.307s-.013-4.088-.072-5.307c-.06-1.22-.26-1.98-.56-2.66-.3-.68-.65-1.18-1.2-1.73-.55-.55-1.05-.9-1.73-1.2-.68-.3-1.44-.5-2.66-.56C16.105.013 15.638 0 12.017 0zM12.017 2.162c3.557 0 3.98.013 5.384.072 1.297.059 2.005.276 2.476.459.622.242 1.067.532 1.532.997.465.465.755.91.997 1.532.183.471.4 1.179.459 2.476.059 1.404.072 1.827.072 5.384s-.013 3.98-.072 5.384c-.059 1.297-.276 2.005-.459 2.476-.242.622-.532 1.067-.997 1.532-.465.465-.91.755-1.532.997-.471.183-1.179.4-2.476.459-1.404.059-1.827.072-5.384.072s-3.98-.013-5.384-.072c-1.297-.059-2.005-.276-2.476-.459-.622-.242-1.067-.532-1.532-.997-.465-.465-.755-.91-.997-1.532-.183-.471-.4-1.179-.459-2.476-.059-1.404-.072-1.827-.072-5.384s.013-3.98.072-5.384c.059-1.297.276-2.005.459-2.476.242-.622.532-1.067.997-1.532.465-.465.91-.755 1.532-.997.471-.183 1.179-.4 2.476-.459 1.404-.059 1.827-.072 5.384-.072z"/>
          <path d="M12.017 5.838a6.179 6.179 0 100 12.358 6.179 6.179 0 000-12.358zM12.017 16a4 4 0 110-8 4 4 0 010 8z"/>
          <path d="M19.846 5.595a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/>
        </svg>
      )
    },
    {
      name: "Discord",
      href: "https://discord.com",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      )
    },
    {
      name: "YouTube",
      href: "https://youtube.com",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    }
  ]

  const features = [
    "4K Ultra HD",
    "HDR Dolby Vision",
    "Áudio Dolby Atmos",
    "Múltiplos Dispositivos",
    "Download Offline",
    "Controle Parental"
  ]

  return (
    <footer className="bg-gray-950 border-t border-gray-800 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/images/logo.png"
                  alt="Logo Pulse"
                  width={40}
                  height={40}
                  className="rounded-lg shadow-xl"
                />
                <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                  PULSE
                </span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                A melhor plataforma de streaming do Brasil. Assista aos seus animes, filmes e séries favoritos em qualidade 4K com a experiência mais imersiva.
              </p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-2 mt-4">
                {features.map((feature) => (
                  <span 
                    key={feature}
                    className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs font-medium border border-gray-700"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                {footerLinks.company.title}
              </h3>
              <ul className="space-y-2">
                {footerLinks.company.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                {footerLinks.support.title}
              </h3>
              <ul className="space-y-2">
                {footerLinks.support.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                {footerLinks.content.title}
              </h3>
              <ul className="space-y-2">
                {footerLinks.content.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                {footerLinks.legal.title}
              </h3>
              <ul className="space-y-2">
                {footerLinks.legal.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="border-t border-gray-800"></div>

        {/* Bottom Section */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 font-medium">Siga-nos:</span>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-800"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Copyright & Credits */}
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-500">
                © {currentYear} <span className="font-semibold text-blue-400">Pulse Streaming</span>. Todos os direitos reservados.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Desenvolvido com <span className="text-red-500">♥</span> no Brasil
              </p>
            </div>
          </div>
        </div>

        {/* Very Bottom - Legal Notice */}
        <div className="border-t border-gray-800 py-4">
          <div className="text-center">
            <p className="text-xs text-gray-600 leading-relaxed max-w-4xl mx-auto">
              Pulse é uma plataforma de streaming. 
              Todos os conteúdos exibidos são para teste e desenvolvimento. 
              Para a melhor experiência, recomendamos usar um navegador moderno com suporte a HTML5.
            </p>
          </div>
        </div>
      </div>

      {/* Gradient Overlay for Visual Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
    </footer>
  )
}