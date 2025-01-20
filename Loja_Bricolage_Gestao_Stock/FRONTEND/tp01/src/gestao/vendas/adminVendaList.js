import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import './adminVendaList.css';

const SidebarSection = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="sidebar-section">
            <div className="sidebar-section-header" onClick={() => setIsOpen(!isOpen)}>
                <h3>{title}</h3>
                <span>{isOpen ? '▲' : '▼'}</span>
            </div>
            {isOpen && <div className="sidebar-section-content">{children}</div>}
        </div>
    );
};

const AdminVendaList = () => {
    const [vendas, setVendas] = useState([]);
    const [filtroNrVenda, setFiltroNrVenda] = useState('');
    const [filtroProduto, setFiltroProduto] = useState('');
    const [filtroUsername, setFiltroUsername] = useState('');
    const [filtroData, setFiltroData] = useState('');
    const [filtroPeriodo, setFiltroPeriodo] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [orderBy, setOrderBy] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [filteredVendas, setFilteredVendas] = useState([]);

    const VENDAS_PER_PAGE = 7;

    const isValidDate = (date) => {
        return !isNaN(Date.parse(date));
    };

    const filtrarVendas = () => {
        let filtered = vendas.filter((venda) => {
            const produtoMatch = filtroProduto ? venda.produtos.some((produto) => produto.nome.toLowerCase().includes(filtroProduto.toLowerCase())) : true;
            const dataMatch = filtroData ? isValidDate(venda.data) && new Date(venda.data).toISOString().split('T')[0] === filtroData : true;
            const usernameMatch = filtroUsername ? venda.cliente.usernameUtilizador.toLowerCase().includes(filtroUsername.toLowerCase()) : true;
            const estadoMatch = filtroEstado === 'todos' ? true : venda.estado.toLowerCase() === filtroEstado.toLowerCase();

            const periodoMatch = (() => {
                if (!filtroPeriodo) return true;

                const vendaData = new Date(venda.data);
                const now = new Date();

                switch (filtroPeriodo) {
                    case 'ultima-semana':
                        return vendaData >= new Date(now.setDate(now.getDate() - 7));
                    case 'ultimo-mes':
                        return vendaData >= new Date(now.setMonth(now.getMonth() - 1));
                    case 'ultimos-3-meses':
                        return vendaData >= new Date(now.setMonth(now.getMonth() - 3));
                    case 'ultimo-ano':
                        return vendaData >= new Date(now.setFullYear(now.getFullYear() - 1));
                    case 'mais-antigo':
                        return vendaData < new Date(now.setFullYear(now.getFullYear() - 1));
                    default:
                        return true;
                }
            })();

            return venda.nrVenda.toString().includes(filtroNrVenda) && produtoMatch && dataMatch && periodoMatch && usernameMatch && estadoMatch;
        });

        if (orderBy === 'preco-asc') {
            filtered.sort((a, b) => a.total - b.total);
        } else if (orderBy === 'preco-desc') {
            filtered.sort((a, b) => b.total - a.total);
        } else {
            filtered.sort((a, b) => a.nrVenda - b.nrVenda);
        }

        return filtered;
    };

    const applyFilters = () => {
        const filtered = filtrarVendas();
        setFilteredVendas(filtered.slice(0, VENDAS_PER_PAGE));
        setPage(1);
        setHasMore(filtered.length > VENDAS_PER_PAGE);
    };

    useEffect(() => {
        const fetchVendaData = async () => {
            try {
                const cookieValue = decodeURIComponent(document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1"));

                let token = '';
                try {
                    const parsedCookie = JSON.parse(cookieValue.replace(/^j:/, ''));
                    token = parsedCookie.token;
                } catch (error) {
                    if (!token) {
                        alert("Sessão expirada. Por favor, faça login novamente.");
                        window.location.href = "/login";
                    }
                    console.error('Erro ao extrair token do cookie:', error);
                }

                const response = await fetch("http://127.0.0.1:3001/menu/vendas", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "x-access-token": `Bearer ${token}`,
                    },
                    credentials: "include",
                });

                if (response.ok) {
                    const vendaData = await response.json();
                    setVendas(vendaData);
                    applyFilters();
                } else {
                    console.error(`Erro ao carregar os dados do utilizador: ${response.status}`);
                }
            } catch (error) {
                console.error("Erro ao carregar os dados do utilizador:", error);
            }
        };

        fetchVendaData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filtroNrVenda, filtroProduto, filtroData, filtroPeriodo, filtroUsername, filtroEstado, orderBy, vendas]);

    const loadMoreVendas = () => {
        const start = page * VENDAS_PER_PAGE;
        const end = start + VENDAS_PER_PAGE;
        const newVendas = filtrarVendas().slice(start, end);
        setFilteredVendas((prevVendas) => [...prevVendas, ...newVendas]);
        setPage(page + 1);

        if (newVendas.length < VENDAS_PER_PAGE) {
            setHasMore(false);
        }
    };

    const emptyCartBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/4QCwRXhpZgAASUkqAAgAAAAEAA4BAgBUAAAAPgAAAJiCAgAGAAAAkgAAABoBBQABAAAAmAAAABsBBQABAAAAoAAAAAAAAABBIFZlY3RvciBJbGx1c3RyYXRpb24gb2YgYW4gRW1wdHkgU2hvcHBpbmcgQ2FydCBUcm9sbGV5IGluIGlzb2xhdGVkIFdoaXRlIEJhY2tncm91bmREZXplaW4sAQAAAQAAACwBAAABAAAA/+EF02h0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyI+Cgk8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgoJCTxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6SXB0YzR4bXBDb3JlPSJodHRwOi8vaXB0Yy5vcmcvc3RkL0lwdGM0eG1wQ29yZS8xLjAveG1sbnMvIiAgIHhtbG5zOkdldHR5SW1hZ2VzR0lGVD0iaHR0cDovL3htcC5nZXR0eWltYWdlcy5jb20vZ2lmdC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBsdXM9Imh0dHA6Ly9ucy51c2VwbHVzLm9yZy9sZGYveG1wLzEuMC8iICB4bWxuczppcHRjRXh0PSJodHRwOi8vaXB0Yy5vcmcvc3RkL0lwdGM0eG1wRXh0LzIwMDgtMDItMjkvIiB4bWxuczp4bXBSaWdodHM9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9yaWdodHMvIiBkYzpSaWdodHM9IkRlemVpbiIgcGhvdG9zaG9wOkNyZWRpdD0iR2V0dHkgSW1hZ2VzIiBHZXR0eUltYWdlc0dJRlQ6QXNzZXRJRD0iNTMwMzgyMTExIiB4bXBSaWdodHM6V2ViU3RhdGVtZW50PSJodHRwczovL3d3dy5pc3RvY2twaG90by5jb20vbGVnYWwvbGljZW5zZS1hZ3JlZW1lbnQ/dXRtX21lZGl1bT1vcmdhbmljJmFtcDt1dG1fc291cmNlPWdvb2dsZSZhbXA7dXRtX2NhbXBhaWduPWlwdGN1cmwiIHBsdXM6RGF0YU1pbmluZz0iaHR0cDovL25zLnVzZXBsdXMub3JnL2xkZi92b2NhYi9ETUktUFJPSElCSVRFRC1FWENFUFRTRUFSQ0hFTkdJTkVJTkRFWElORyIgPgo8ZGM6Y3JlYXRvcj48cmRmOlNlcT48cmRmOmxpPkRlemVpbjwvcmRmOmxpPjwvcmRmOlNlcT48L2RjOmNyZWF0b3I+PGRjOmRlc2NyaXB0aW9uPjxyZGY6QWx0PjxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+QSBWZWN0b3IgSWxsdXN0cmF0aW9uIG9mIGFuIEVtcHR5IFNob3BwaW5nIENhcnQgVHJvbGxleSBpbiBpc29sYXRlZCBXaGl0ZSBCYWNrZ3JvdW5kPC9yZGY6bGk+PC9yZGY6QWx0PjwvZGM6ZGVzY3JpcHRpb24+CjxwbHVzOkxpY2Vuc29yPjxyZGY6U2VxPjxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPjxwbHVzOkxpY2Vuc29yVVJMPmh0dHBzOi8vd3d3LmlzdG9ja3Bob3RvLmNvbS9waG90by9saWNlbnNlLWdtNTMwMzgyMTExLT91dG1fbWVkaXVtPW9yZ2FuaWMmYW1wO3V0bV9zb3VyY2U9Z29vZ2xlJmFtcDt1dG1fY2FtcGFpZ249aXB0Y3VybDwvcGx1czpMaWNlbnNvclVSTD48L3JkZjpsaT48L3JkZjpTZXE+PC9wbHVzOkxpY2Vuc29yPgoJCTwvcmRmOkRlc2NyaXB0aW9uPgoJPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KPD94cGFja2V0IGVuZD0idyI/Pgr/7QCcUGhvdG9zaG9wIDMuMAA4QklNBAQAAAAAAIAcAlAABkRlemVpbhwCeABUQSBWZWN0b3IgSWxsdXN0cmF0aW9uIG9mIGFuIEVtcHR5IFNob3BwaW5nIENhcnQgVHJvbGxleSBpbiBpc29sYXRlZCBXaGl0ZSBCYWNrZ3JvdW5kHAJ0AAZEZXplaW4cAm4ADEdldHR5IEltYWdlc//bAEMACgcHCAcGCggICAsKCgsOGBAODQ0OHRUWERgjHyUkIh8iISYrNy8mKTQpISIwQTE0OTs+Pj4lLkRJQzxINz0+O//bAEMBCgsLDg0OHBAQHDsoIig7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O//CABEIAg8CZAMBEQACEQEDEQH/xAAbAAEBAAMBAQEAAAAAAAAAAAAAAQIDBAUGB//EABkBAQEAAwEAAAAAAAAAAAAAAAABAgMEBf/aAAwDAQACEAMQAAAB+sCFIKpCkLUKAKAACgAAFAAAAAAAAAIAAAQAAAgQogQpCkikKSKShSFqFIUUAAoAAKAACgAAAAAAAAAAEAABAAAEikKSKQpCxCghYlCglUhSFqFAoAAKAACgAAAAAAAAAAAAgABAAAQAAgACRSFJFoQtQoAqFIUlUACgAFAAAAAAAAAAAAAAIAAQAAEACRSFIWIUEKASqQpC0AFAAKAAUAAAAAAAAAAAAAAAgABAAAQIUkUAEikKQFqFAFQpC0AAFABQAAAAAAAAAAAAAAACAAEAAIACBCkLEBSAtCFIWgAoABQAUAAAAAAAAAAAAAAAAAgABAACBCkigAkUhRUKQoqFIWgAFAAKAAAAAAAUAAgAAAAAAAIACAAEABAhSFgQoqFBC1CgUAAoAKAAAAAAUAAAAAgAAAAABAACAAECFEAQsQpC0IUlUAUAAoAKAAAAACgAAAAAAEAAAAABAAQAAgASKQoJFJQpCioUCgAFABQAAAACgAAAAAAAEAAAAABAAQAETCzh3c/Vr3bsNhCkLAlCghahQKACgAoAAAABQAAAAAAAACAAAAAEABAY2cG7n8/fzedt092jpzuP0HF6MAQsQUBSFoQtAAKACgAAAAoAAAAAAAAABAAAAACAxTi3aPO383nbtGm2GxOnC+xy9vo6OmKCFJFoQooCFoABQAUAAAAoAAAAAAAAAABAAAAAQwT5T0vI58kXNjvxvo6On0NHT1a9wJFIUEi0IUVCgUAFABQAAAAUAAAAAAAAAAAEAAAAIeSnhd3m7Nur0dHR6Gjp7NW6qIAQIUEi0AFQoFABQAUAAAAoAAAAAAAAAAABAAAADUnjHblj3Y5VQAIEKIhSFhQELUKBQAUAFAAAAKAAAAAAAAAAAAQAAAA5k5D01EAAIEKIAhSFBC0AoABQAUAAAAoAAAAAAAAAAAAIAAAYnClXuAIACABIoIUhQQtAKAAUAFAAAAKAAAAAAAAAAADAwMSEIYprNZrMDpX0QCAAgASKCFIUELQCgAFAKAAAAUAAAAAFAIYGJCEMDBNZqNZrBVxSL0GZtMzlT0l2AEABAAkUEKQoJVAFAAKAUAAAAoAAIYmIIYmBgmo0mo1lKtNSdS7TaaU9RaDlMTsANaeceooAgAIACAIUhQQtAKAAUAoAAIYghDAwTWaTSaTAhmuRmDpN5tB0gHnnoAHCncsByA6wDSnEekoAgAIAEighSFBC0AoABQCGswNaajSaDSYrSJuXM2Gk9Q6DacB3gHOdJDE0HSAcB3ghxJ3LAchTqAOdOY9BQBAAQAJFBCkKCFoBQACgHnp4RsOtdxmD1DIHGnaoHnJ6KgcB3gHOdAIaDoAOE7gYnKnYsBxmw6ADkTWdygCAAgASKCFIUELUKBQAUA5ziTYekoxONO5QONO1QPOT0VA4DvAOc6AQ0HQCHEdwMDlTqWA402LtIQ0pmdSgQAAgQogCFIUAVCgUAFAMDzEp6q0hwp3qBxp2LQeceiCHAnaohoTasIa0zMTE0gwIQzBV0p0LSg5E7V7ACAAECFEQpCwoQoqFAoAKADykHeuwhxJ1rAakzIYmgGAMTYFpim1QNZuMimg7jMhznUAeWnqKBieanoLmAQAAgQsCFBItCFFAQtAAKAeQmBsMirgmxcimpNi7DM409FdpTzz0ADnOgEOc6QYnKdgNZoOoEPOT0lA1p5p6qgCAAgASKQoJFoQpKoIWgAFAPPTWdR1qOQ3G0HOZm4HCdZmDzz0ADmOkEOc6QYnMdYNJgdAMTgPRANKcB6igCAAgASKCFJFqFBC1CgUAFAOJNB0Hao5TYbgc5kbinEdBtBwHcUHMdIIc50gxOc6gaCG8Gs5TuAOdOQ9JQIAAQIUQBCxBQpCioUCgAFBzHGm49BRzGRvBoBvByG02g4zqKDnOggOdN6wxNKbVhgmC5kMEwNpACHeoEAASKAIhSFgQVSFJVBC0AAoNRwpTYCEKQpgAQgIQxIQpAUoKCmRSFM1pgg2qBoTaveCAAEACRSFBIpC1CghahQKAAU1njpDqXIwMDoKYmg6ymoHSU0Gw6DI5TrAOU6gazWbwcxmbgcpkdAIeem061EAAIEKIAhSRSFqFAFQpC0AAoPNTA7zeuByHcDE4T0AajSdYNBDpByHWAch1AwNZvByJuXaDkNhvBieanYu8gABAAQIUhYEKQVSFIWgAoABTz01nWdS4nCnoKIecnpKNZzHaDUajqByHWAcp1A1mJuBxJ1LmDjTcu4hgeYnprmQAAgQpIoAJFIUhahQQtQpC0AApwppOk61Hnp6KgeWnqKMDkO4GBznWDkOsA5DrBrMTcDz071oOBOxcga08s9hYAAQAAiFIWIUEKCVSFJVAAoABypylMVETJRTSm5aDWm1RTUm1RgmxRTWmxaRIuYOdOhaDQm9RSJyHrKAAIEKSKQoJFIUhSFqFBC1CkLUKAOc8pIbyrrTIyUc6dCwGtNiiGCZqMEyUDFKoiAowTNYCJVEMk2HrqABAAQIUhYhSAAFJVIUhahQKAAcCcJ0HrLypmvQDxk9lRDgT0FGJyHaDkOkyBxnYDSU2g8tPUUYHGncoHInMemoAiFIUkUAEikKSLUKQtQoAoABQAak8AzPVKZm5anlHqLmU85PRUQ4juBym42A4jtBoMzYQ8tPVWGs5k7VA4ExPQUAQIUkUhSFiFICxKpCglUhSFqFIUUAHnpqN5iUENJuICGQBDIGANpkaTpXI1psXYDzk9NaaTWdRDSnGdq7QCAAEAQpIpCkikLUKQtQpCkLUKQooAIaTBMSEMSEIQxIQgKUoIUxBkYEBACmwhuNpsOhQIAAQIUhYAELEKSqQpC1CgAUAAoAABQAAAADzjiSm07VxMTExMSGKYkIcAKdJ2nau4AgACRSFIUkUhSRSAChSFJVIUCgAAoAABQAADWYgGhBkbFAEAQFgTnNq6U3HSuQBAEKSKQpCkikKSKQpCkLUKQtQpCkLQAhRQAAAUAA40wBQADmNJ6ABQAAAYnGdi9pAAEikKQpIpCkLEKQApKpCkLUKQpC0AIUUAAAAFAAAABifOJ7C9oIAAAAcR5ie2uwAJFIUhREKQpIpAAABVIUhahSFIWhCgAUAAAAAAoABDA4E9FaAAAACHIlOpQSKQoAiFIUkUhSFIAAKApC1CkKQoqFBCioUAAAAAAAAYIM1AAAEAImBmVYEKQFJFIUhYhSAQoUhSFqFIC1CkKCFqFAABKoAAAAAAAGhM12AAEACFGCYmxSFIUEikKQsQACAFCkKQtQpAWoUhQQtCFBCgCgAAAIUEAL5qYHpLmRCgEKATBeJOwzUhREKQpCxAABAAUAKQtQpAWoUEKQFGKFBAUDkzxwrrwuyUcqYgAAGZgch6ygYWcmcyjswyIWETzTed4UkCkKQsQFIBAAAUAKQtQoIUlUEKNaeSbDIAAGGU+e9HgHoc2/1OXpAAAAAyOU6Cg8zq5/N6ecfQed3bscgKDiPeUkUEKQsQAFJAAAAUAKQtQFIUVCgnGch6oUAgL8zcens4By6d/taOnuBoOQAAAyOs2KORPD383Vu0Dl5O76bHKqCcpxnsEUgKQsQAFJAAAAAUAKQtQFIUVCjUnlkCkAHGtyxtgxxsmXSm0BSAACBRrOYtxyyghjhl2hSbj0FzCFBIpAUhSQAAhQACgAKQVSFBCioUEBQCfli+p18Xd0co8jj79Gjo+rPpQAACAAHz58massPoPR8sacNng+f6f6ebkgUgKQRSFICkgABACgAAoUhSAtQFICioUAg+eX5M9fr8/v26cbj5vL3eTo6vrz6IAABAAUeGfDHp5Yev6PkbdW7lyx8fz/W9I+1AQoIWICkBSQAAgABQAAUKQFIWhCggKKgKPz80m3r5PsOfo5Nmr5VWjf7B9cAAAAAg8ZfjDPLH6Dq5fpOPs+M7uHz+Hu5z9OShSCKQFIAIpABAAACgAAoACkBagKCAoBPztcTft17OvTkcPD0Z45ekfZoAAAWAA8A+VB39/Mppy4eXfzn6WbUEUEKQFIIAAQAAAAoAAKAAFIC1BAoIIvxh55qPds1njyj6Y+hAAACAAvEfn50HYejlPFxowP0VCggKSgEAABAAAAACgAAFCkAKQFhEhFhE4j4VekxBSH3ZmUAAAAESHyC+cbTEzOU+qPbKlKpKUyAAABAAAAAAAUAAFAUgKCYmK4kTWupNS+efPnMU6z6BOo2mw2AAABYajWak+fXzTA3HrHsJuNi7kzC5GSZFAABAAAAAAAAUAAAoABAuKQhFhiRBAFFKCgAAIBCEWAIKoySlKpMilKACAAAAAAAAAFAAABQAQBSQABQACAAAFAABACiFQApAAKACAAAAAAAAAAAoAAAKApAAUAgAAAAAAABQCACKQAAAACAAAAAAAAAAAAFAAABQApAAAUAEBQQoABAAAAIAAAAQAAAAAAAAAAAAAFAAAABQAAFIAAAAAAUEAAgAAAAIAAAAAAAD//EADEQAAEDAwMDAwMEAgIDAAAAAAABAgMEERIQExQxMjMFIVAiIzAgJDRgFUNBQkSAkP/aAAgBAQABBQL/AOorntYOrGIRStlT+jq5Go+sjQfWSKLIUzGSMpVxqP6Iqog+rjaPrJFHSXXJVLKojBkLnlPTba/0Ny2a57nGallURgyJXDKJyjKaJn9GqX3EW41mSso5HDKSJp0/o71s2W7lZRxNaiI1P6TIQpeb+lXRCR7b039CyahusN5pumbzKQu4ugrojdgQ5cSEE2675jNpuMN1DcUzeZPMhXsFlhOTChzmHLepuVThyVaNbFUPdwnnAYJQwHGgaj2tajEsz465m03Gm4ZqZuM1NxBZoxaiFBa2JDnopyZ3F6xxs1jjYnWT/HqJ6fEJQ06GxEjkaia1Phj8+r+1/uvw10MmmaGZmpmbgszRaiIWsiQX1CNDnq4SoqHrjXOONWOOBMM9PRwnp0AlFTIbETWw/oT+Rr/21qOkPfrIdZfgFWxmbhvNFqGC1cQtfGgvqTTmSuM6xwja15wqtT/HSKf4yMZRQbqUdM0SNjdI/wCRrFqvbF+hv8jVO7Wbvg7dZOsXvN8BWZ7WFYo2kqHuT0tRPS4RfT6ZqRU8CKjWpq3rqnn1b/J1j66L0i/Q3+RovRvfrJ5oPDrJ1g7vgJ0vD/rTro7tb+j/AJ1Xz6/+Tqzv0XpH11Z59Hdre/Jpkhmg/vieiRbhuGai3UgS3wLkuxnvH/00Xt/Q7rq/y6XHfyMmmaGaCOs/cQ3DcGqqLm4zU3DJqP3mHIiN+M3kVdxxeU++K+ZDbqDZnOPIcYdFZKeNGs+Bb7K3ox6YZoZppuG4ZqLdVyUzU3BXMvvxnIhOQw30vuPLzFqg/cK7bqTYmOM8bT5LxGHEiOLCRwxbu1GhZB3bF3au901d2ydGezPgXTRtk3mjZXKl5y1QfuLoyocmxMcZ46nsrKVit4kJxYSaGNokbC2k3fr/ALtY+/Rekfl0f2xd2i9E/Q/tk+Dm9pv9kPXR3ki8eknWPs0nGdmlR+j/AHas8mi9IvJpJ2R92jujOusnTrL8FUDusfl0k74umkvSLt0nI/HpU9uq+bVnk0d0i79JeyLV/ZH36yEfvP8ABVHjd2t8mkpH10m7ItZ+kS/buhdCo92NcmOSGSDl+7khmhmg11pNxDcQWRLMfi/eQ3kHSI8bKjTkNOQg6Zrk3Ea/fN43lMsiFF3PgpEvHZduzrbzzdkFV70zkM5TOUu9yXkLyF3nuqZOMlMzNts2m4w3IjditnEZRl2GbXL7a/U9cXmMgu40bvOTCcwqByTtGpM5dqY2pTZkHNehTZL8G9Fc1EnUxmVEp5FTiuHUyojae68Npw2DqSNGxU8bl4kJxISSmiRsMESt48JsQk0UaMhYzaxaWQl79WebR/SLWXrD4tJesX6HlP4/g+krSLxju1nXR3bB36SdtP2aS9kHh0m66s82j+kXTSXui8Wj/JD2aL0k6Q+L4OT2nTyQdBeiar0i8mj+2m6aSdtN4dJ/0M8+j+kXTSbuZ49HeSLxaO7ZejPZnwc/evfF3i9F6as8uju2n66P7abx6VHbqzz6PIu3SfqnTR3VnszR/bJ7r8JP2uFk2nc+I58Q+aNhz4jnxHPiFljjl58RzojmRuVKiOJ/OiOdEJVxvVlRHEc2I5kZJM2WPmRnMjOXGbzWS8uM5bDfY9Unaw5TDlMJHtc3ksOS05LRXIreQ05DTkNNzM6zfCTXSPkLbkqJUSqm/Kb7rpO+2/Ib8gs6X33m+433CTplvqb5vjZmm8byDp2Y7zTeabrDejV27GbsZvRIu7EbsJuQm7AbkBuU5uU4ktOhuUxuUxnTCTQNIpInTfCubYa72pZbKO8sPj0n8mi9GefR3bB5NKrwN7dGfydH9Y+zRfJo7tTrrKU/m+Fe26P9pMFyjk9nu92KjTNDJCo95WL9GjfPovSLz6VHhj8ejP5Oj+sfZonl0f0Z3ayKUqfDz0+Yz6T2FRFSyGKGI9PuYqWcfWfVllKZym5KZuY/kPOSo+bcYyqajOWw5TDda2o5EZvxjntc5kjcc2mTRntNpJ0Z36OeSdI24M+HVEUWFinHacc46mw82JDamNuYxnPvF5TN5uqb5yEN9DfabrTcYZRl41LQmEI1sbXbbFNphsoOZddpxtyGEo5JC0wjV0az3+XqaZJV4RwyKkRH8WE4kJw4jhRnCacI4TjhyHEmONUGxUm7Ib7zkOI3TSo2KZRsaN+WV1jNTNTNT7h9wRZEXNxm4zcZuM3GbzN5m8zeZvM3mCiZIix3WO7ERb/LuSS/3i0xaYtMWmLTFpiWZ8JHV7j7TGMpjKYymMpjKYymMpjKYymMoqSoclUIahJPnnNRzZqXadTSZs/HPCkiI1Wqx2bfnXtzajVY5PdPxvZ7x/SvzyoJ7flt/QFWytdf8i+wjvn6mSytkGuyT8Tu3IauTfiLmRkZGRkZGQ6tgYvPphkrJG5GQ57b5sM2GbDNhmwzYZsERqkrLthmwdkZGQ6VrG8+nG1sDlyMjIyFcK1YyB/1fDSPwZyXiTzKm9Obs5vTm9Ob05vTj5psMDApHPjdvTm9Ob05vTm9Mb0xvTG9Mb0xvTG9MJJOosEiu3ZzdnN2cq3PkMDAjlm29yc3JzcnNycmR+1G+0nw1RG6RsdMrX3Lly5cuXJqauqZuJIcSQmoJ3JSrUJHcuS5qlqktUlqktUlqktUlqkRJxqKhcuVKzrHDQ1DTiSHEkI6Wtp50X2uXLkyPkaylej/AIaRFc286GU5lOZTl5y85ecWtRrkrbnLOWLXIirXIhHNJK285ecvOXnLzl5y85ecvOXnLzl5x8skTErkU5yHLOWcywlciuynMpy841s7hrcU+Oe5Xy0rPoxMSqZ9zcyT0R37f8nrS2o0ekbYmqsmJiSt+17sdFI2aP5H1epWKGNhAqWaxXjkxWaznyNPRW/tPyersyoWpkrERq9RY3Ikiokb2HpNSsU/yPqL9z1C+EdN9LKJzNqvc0nW0kqHoj/q/J6q/CgiQX6qimcm9I5m3Kt2xe7FXbkRbp8hWJb1B/hgTNEkfGrc5n1A/t9F/lfk9ZT9lEJ7TuRzUWZ6o5rmxxdZSP2i+Q9XiwqWLdGqsL21zHJNXfQ1Nx8rj0eLCn/JWRb9LGpI25TVm2nNhaT1Dpn222U8fIq/jrlzIqom1MCo6GTJHJtNNpiDnlPA6qmbixuRkXLly5cuXLlzIyPUabbkZIKxjzaQTFg99z06m47MjIuXL/FqLcW5UwJO19JPGXe0TceMopXkLNtvue4n4lPcX3J6Bbq2aMzcNgnkIKXZVuQlxBPjLFjExMDAwQwMDAwMSxYsWLFixYsWMTEwMDA20MEMDAxMSxb/ANR//8QAKREAAgEDAgYBBAMAAAAAAAAAAQIAAxESBDEUITJAUGBRECIjkEFCsP/aAAgBAwEBPwH9opYDeHUoNolQOLj0gkDeNqUG0bUO20sTvKNNCOcoG1Sw9GbUIsbUsdocm3lpeZRUdthKNDA3PorFy1jMZcTKBXbaLpT/AGi0UX0fUjF7wBm2i6VjvFoIvpTIG3lrf5M9xMh2eQmQ8u3ITOZyi1z2NdrTOZxDdR5ZhdSJwzzhnlGkyHn2Namz2tOGecM8QWUDyxYDeZr8zNfmAg7diSBM1+ZmvzM18tqTYiZTKac3TsX6TMplKTfePLarqESi77R6bJvNN0djU6TApJsIdO4F5R6x5auLmJ0iV+mUBZexbpMoCzfRR+TyzreC4liYosLdkUtOZiJ/Pplv0a//xAAqEQACAQIEBgEEAwAAAAAAAAABAgADMRETMkAQEiFQUWAgBCJBkDNCsP/aAAgBAgEBPwH9ooBNoKDR0K39IAxi0GN4tFRMJVdlPSVRinoy0WMWgovAALfAuq3lSrzdB6KoXDp8CwF41cfiNVY+j0DisJAvGrgWjVmPpQYraX/yZxTYzKfxCCL7EDG0yn8TLYd3W4417bGh+eL6j3ZTgZnrM9ZVqBh02NKoFvM9ZnrGOJx7sFJtMtvEy28QqRfYgEzLbxMtvEKMO7ULca+rYpqHGppPdvp7RqireK4a0r6timoQnC8FZTKmg92oWj6jKGqV9WxXUJX08G/j7tSflMKq0+1BHbmOOyRw4gRRKz/1HdwxFoSTfac7ef0a/wD/xAA+EAACAQAGCAQDBwMCBwAAAAAAAQIRITEyM5EDEBIgIkFxgVBRYaE0cpIEEzBCYGKCI0OiFOFScICQk7Hw/9oACAEBAAY/Av8Aui8TSKk2Ux/RFLdBw8Rbs9NTclS6fOwoVjq/QtboKuLoVURKW6dzhjSbUrf0I23QUybe5wxbOJ7JZT1/Q3oNFEYt9DioiVra6/omhcxUxpfmUJUfouny/Rdo60Sf6CtReOb7FUJFz3PyoxFkV6Vlcm+5YjkcKq8/GbyLSx5FxlizL0TFK9I89ViKjh0cn/Eq0MilxS7mztxVVJxafJFekmy631kYUSqKQl6eIWrVdZd9z8pfRiMvPM5HI4VT0OHQz+kq0L7s/Ku4oPSpUnFp5dkVym+5h09WVaOORUktbJ+iW7R4PaWnMsLFmWovl9lvucjkcMZPoiiOhnkYdHWRXKC7nF9oyicWmn2K9p9ZGEu46NHFdjstyPfcy3IrzZpH67sfAuReRfL3vq5FRw6Kb/iVaCXcupdZFelgji+05ROLS6R9yhxb6yMGHdHDCK6LU/l3HrZ2W4uj3O63IL1JPzl4MnC2k/Ku4k9NFU+hxfaJdkVy0ku5h5sj/ShkVJLXluLc7bj6bnZbn8dzvuR9Bbsn4C9UXuR6/gLcj33H03H0W5/HWxdy3W5ctkivTVYWFg6fAWvTdY/m/AX/ANz3IMt19tVhYWarS97m1tqwxEXznkVRm+xg6QwHmYKzJcMOEvQRirIr07yK9NMvyzNrm/ApIaEf7amtVhZrtL3uUuaL6LxVtPsXJ09DBmYHuYUczZogi/BGMvpK9O8h06WZenmWP6i4PgjZ5FyORZq7bk/WVG8ungTqlSVaOeRw6CRge5hRXco4EU/eRRj/AOJXp5ZGLMTcp5lj+pmGVQjkVQjlrj82523H0W5Lotx9FuL1n4Qn5rVJbi1rrurprXXcW5LpuT7bktzR9W92PXwOLEdVrQ+u4+uvIj0347kum5Pcl11sh8u6vA+giOtdSW5LruItLdSr1we4+m5M5ZnLMopQ61aXkXkUbXsU/tOeR+bI/Pkc8htrl4HJehYJ0Oow5GHIdMGjC9y5/kXV9Q1KjM/JmW6MvQGpTiYscjGWRjrIaempMcx2Y0ijbZemf3C5pPcw9I8zA0nufDyPhmfD0nwy9j4ePsYUSlQgWaM/tlsB8UajEWRjexjexi+w3KVPgbSdDMVZFP3vsJ/fvIx5ZGNIVOlnWjE0mZfnmWzzK9qzzLH9TLnuyqBXBWmFHIwoZFUI5EeFWeRdWqHXcl03JddcRa11JfNu9/BJL1Gha9HlrYvl3HuR1w+bcl03JddaI9NaO+7HwTqMa9da9Jbke+49xa4/NuS6bj66/wCJHpuR3UvTwSLESWuXo6dxfM9yW531rruS6bnfXL5dyT9BdNyjwVPyYmbbsLxeOJ0KaL5fL6HtyorpRfRfRsqarGnNJmIjEiKKmqxxc1TSYkTEiOiSdBfiX4l+JtOSriX4l+Ikpo2XJF+JfiSkpJl6JeiXo5kqJJ1F6OZbHMtjmcuxHr4LVDb9D4eVBT/p5FK0Ez4fSHw86Sr7PpKD4fSHw+kyK9BOk+H0mR8PpMj4fSZFWgnT0Ph9J9J8PpPpMDSfSOjQT9eEwNJ9BgT+g4tDNL5TAn9BgT+gwZfQYc6flMGX0GDL6Cn7uS/gYbf8DCf/AIzC/wAB8LVP7TD/AMDD/wADD/wGkqKf2lxfQXF9BcX0HDw9Ii2W2/BmhwPu5dtS3J9N9mk1sWuXy60LX/Pcj13X08I2lZqi/UfXVaOjnEXTWtyetkemt/LrQtcfne5HcZKXg+1C0odWqjVaWshWXi8Woq8j/csLo6EXXkXfYlGjkRXpr2uTiWloqGLiLyLUQp9dztrq1JeEVrVekX2YnsX/AGLyLYlizLvuXGYci5LIuvLesRdRWkXSz3KV/wCy88y/IxJEVtWK0xfYxVkYiFsySqL6K5U6qX4wpa+KtFwuvM/NmXp5mJIxXkY3sYqyL8S9E/LmXWXWWMpjAroR5+LWF0ul3XYXPcue5c9y57lz3LnuXPcuFwuFwuIoWjRhoo2PGOGtFnuWe5Z7lnuWe5Z7n+5xp0eZsq1+erkcjkcjkcjkci1FqPPVs8/HqJKlFVnIoleX4lKvFKKfHqCn/k3R+jY7NbKSleL2FhYWFhYWFDnWYnsbUHSiwsK0yxljLGWMsZYyxl1nCq0ejLCwsNqVSL/sUKZYWFhYWFBR4O5FpStFLIwpGFIwpGFLIwpZGFLIf9OSqt1tQTdPIwpZGFLIwpZGFIwmYTMJmEzCZhMwmYbKaDCkYUjCkRU1RrjRBuq0wmYTMJmGzalyI9fB0kJyrRYWFhYWFhYKWklFQTqimcjkR+7ajJO2k2ftFDa/MuZYWHBacszlmcszlmcszlmcsytorbZYWFH2dLafOXIk9JJSlLnScjkOeilHZbri2VosLCw2VUhNvwfhtMNmHIw5GHIw5GHIw5Di3WuRU9dDkVs2tHFyXmjDkYcjDkYcjDkYcjDkYcjDkYcjDkYcjbnFxiuZVIva62KKlW7DDkYcjDkVrZ6ltPh835yY+uun0KJWmkj5T/FivOZ6ib89chNchTg6U/EloYvi0lvTU15FSKyjnRqlLzn+LT/wOkpE356qaB06vuJPhnZ18Sn+2ob1qgU/LVpdH3/Fl+6rUv2ip1SQ4+Qpq2LpE/EdN8wyiNpU2ihVso1aR/t/FXpNapClyfMocmbUqqbCb1RXp4jHTcpr3KGUZM/raKOk9TY0cI6OPobTurVLSv8AuP2/F0mj5tVatuPK0oqcXamUw+zQUvM85MoIQ5U0vxJ6OXZ+Q4TVDRRKsqk0VtvVR+VXmKMakvxnp9Hdlb6aqbH6F9nDq254kvbxPiVfJlS2l6FcWuxwwk+xTpOFGzGNC/HoKdDkcWjkWMqg11Np8UvP/qZ//8QALBAAAgECAwcFAQEBAQEAAAAAAAERITFRYXEQIEGBkaHxULHB0fDhMGBwkP/aAAgBAQABPyH/AOoqKdUY2jObHF4rp8P+IizTFsoqNuiLSiCdzLbxZYQRqiGJGMmSWP8AwqGUJiyjO36Opw25VY+YPi3I7QRMUv3m4DJ9YEuH/CLtguVzubGy2xYozjSUVJaYKrKhXxr/AOGascAhnYjpE5CqMnqyosfEpJIShZf8PzgVCs2hEeV9txIwkwS/4p6wVdwz/wAW7xFqxqpaMg8x/wDBO8Vqxp4HpUweUJO6J7KtR+6R8dWgfxNwe4AMY7dB/Dd4U9YlK4036hrdEYDxgcxwZXqHxkchvx6EjiiEL11Y7cGuiLkez5j5Ep7jIsrEydrZifd/OYvm5L4Eb6kG5a5ik6NheoXIK7SGn7jMb0RkbyMPqDynMfGRoh8bkCF3DgAsotGaBxB5jgBoI47nlV6pVJsTLrkHu/PyQMTaHyYnY0W1uaLyBuOKTE/R2q6dTKcjATcjVHgGob4Y149KE79QSvLUcDFkY91oyVI8HA+hgvfOfwSqUL8YkzN5EJ+7Pg478z9zgjuCiJKm4dnuFX8cdyrCK7lWg9txqJCULP0GAPS5jVfQNVwndgpg9SziyadD2tsfyF7jSPzMBdncsV5fjMXxGXwRq3mYFs6x7nb1FsoztrgewtvaHHuH52O5a3CrVTnBuN2CVcF6CkhSXiGlLjeJyI6ZjF/oIT759SWqbzWRtWUW4HZcW2hdxTyvZ7lC57ntm2/oXPcLer323dCz+23OnN9heY2++41Ys8p6DoGo6h4z228UvJ99x05fnco1V77ls7cdo23NNyDsfvrtboDqRviMr1M/savQaeFMjJU4ojh3PxX6P0RXYhqrCW8fQc6mKjQTvwE5U7O0LPIj9ty/o/cVttL8/htguKGSkUl1MoZr6Gp0FvePyMrujS6jZr+hmauS4H6/M/ZobcV/NCwCyJGq/cHgHyMJtoEslsmJbM1kmtzf6Ibg6oWBcVRNXyCS6tDJ7Ayio0gTJOFep3G3PoS5K2tiVm6wavUPAY6tXFJ3I4LqSwdf4fomViMZoRqJ9h+ah4lDy0HMaLk8K+R9IDh5ZVEtufKJLPzT7JOFqglANRN/4TX0Ekt1af0UexDkqRJ0gxnnFbqxCrebZGW5JbhWCuUSrIuReLG55CbihhgsP0JINfVQKdznqKmqRJbrT7JbapCbalN/4L9SU2ZPdFp/RN7AQqbZeK+huA2Vxnagk8D1bY6or9gqk0tEEisktlL8m4rdXvtdtwlzcpfOg21wq5n903HFTSxLKPQkAHTUPzU7aFzlHQU23uQt8/fatVqNLcm2mWCbj7b2ux2jbfOy2nqParbQ4sp/CdxqCw9DJ14LseGW0ofn8Flg+2080WGDbeDX3Fem28bQVtvvvbc7Ztunstt4ufbeAWjhPcaqOQS/Q0meJMusBobjTbe2T3LXOdt1nB2+Lp7ir5kDKdSLIclQcBmmZ2FYCX7Gt0NToZDET+KGQ+xkd0OMqdREiLriZoZ5QXH4kfaq77B8KMbJXAJHKlFpI47G5AtklrnE6izL0SxPCU6EC0zTY8SfqQkmEUliQ20yby/e3EQAVNUgJJec2e3UjVI3DGSVCllYx36IxeyeaQ3qz4dHxM55mW3Uz0OEmJYD9kIX82Q1UE2GpE4ctHnBlnMSlK5tVCUdZsybn/DSc39ETNRxSROxaNj8t+6n7f2S9VAjHkKL0OUnWZI0ICY8H94l9kp/ZMcE/l6EXgS3RidJ9bFtDUxhc1Lv2cZr9Zju4HD4sb208WzXgI0wqOyjTjIrdAg4Io0+52Dcfz02/lpuGtOQ4+O4ejFh3i3okbCZ5yqbKw9TXa7AbqPfas/uA/UXstqy3P2HnbXeTc7LuPcdr8pP2O3ba05/BxcW99rQwwWNKfRE5BMoRiNpti+UrS99tweOU3Kx03Dom9tr5Pfc7DuHddrVZMLCMm1ulMo0J23hgmRJ6IkapFDsR4xinZcKMt9m12HjTu25WmXy9wvrB9t9gm52XbatS7q2sJIRZbW0n2Eg4JuVDifoq7IZSGRCp+KPzROU1aZkuhkuh4Yro1rDwx48S5m2SSgm1GIazPAngBiC2UJIWqEjaaseAPGDbpGY4bjNVBBKhvjtJplLbshc0bTdHsXyJYeCccDzZ5fYpu5A4bijGaJRtGKSz9FO684G2bJQTw8GJTNPjsZ0bnLBj65RCZ4FnkQu9MablM8jPKxwV6slc3rPIiX9ZRWPnJcq54jI/p8H430SCZb1L4Pwfo/J+j9f6OOSKznC6H6v0fs/RASis1D4J665y+DwT6M90/RDBSilKE9j91+j9V+hw2dP0IWCXJJXseCfR4R9HjX0S0qrwIwZeo9Gi8PgSPXVUSzKcWynPlHAwbXfbTzPcVVsuaFOufbb2BZ5rcLS/JbfwZ7f05bmqXTtvFeZ99xqsSW4ejLXcusyNESGUtyIeFChG7yRm7MnEJBLldYErZRyvZ7buh1qT3O8vy+2382e5uz2157O233TtW+27ObOPR8OcaxJ0LbBleBEUKqZ+5Mx1IEy+41PzRluhBnGupjJBgI/6M52Kw3KTsQXJFd+osouH0VkR+J2KYtgNoMCTEVNJSPOFL5jAVXJWK2PHX7C0ZN77G0rs4HUcAx14+kJYQ9TgjWjMg5keA4DDCUYJxcTmQ8QRfyIX7kQfQR368jukRV0ZpnkihwKOKQS36BL9I4cqLUJuA/BhSnTQvmlvAYXXRgdoandJlphfvmYWwaw5wlmWLj9VivttkuGsvWILVSggc4itMhjb/THhHOPKB8JXIYXZMpsH88zBBDZ3Ui4vNkWIR7ROcGmk4mYL55sl8bbP1Z7QnZm+pm+o8X1Jwk4ScOa134zMyMoMh1Ml1Ml1Ml1PJDQBQ6SAoyhuaMwDXq67w5hG5mIMgMoMpCNcpwVQlTosWGl1PyZ+TPyZ+TM3qM3qMzqM7qPIHmBVKS0MbEOU0O5PLn68zKMumY6e4bLfL/pGKjuLNBoher15LHI2uhqi/0TWrMsOD9fW6i/6GpX/BfIp4/6OKnr/CAvBBCiF/5iSwpqUyMfpEwaWahqGoahqGoag6rpLpKT9GNUCRqGoIvW6HjTxp408aeNPGkv1nyEhMrV3CgvMNQ1DUHZsXFn7sJ6su00NQ1DUNQZFGkUJrcCox+joecLEblyWEFNCx4I8UeC3CEInPkS23gUqzcIQngDwp4U8KeFPCnhTwpwQ1H6BS5ElR2DwB4QdNY1h7elnUM25u6muOtBZWWsiZejnLpQ5ZDWjgaxrGsaxrGsOmjMWcm6Kvs/Rn6MdkolRggzam9xrGsQdqY8f8CIiIibsOZeZNY1iG7xoPHwS6p+jP0Y6ZlUVjWkqfFGsaxrEf0y7bECITl+j1ahLDajonhDwh4Q8YeMPGEZd0PAI4iCeLJ4sQIDfA4CkrhDxh4w8YeMPGHjDxh4w8YeMPGHjB8ugY4uFRqFHBPFk8WOKYEiVAyExZ4Q8Jsx1YZi8SY+no67xvmRbV0iCXWuIx8JQ6f6tQcJPoycRLWRVUpe3nVkZ5JQm6nKfqUIK4w2JFJ3VONQyJYZfdEoISKZV09F/q9y8H4/I6QUtKEhVQrkuPA+bIFNSrDD7TepHJcIqULdKhU5uRhLSS6EyOVBDUjVw8JfZ/H+r0Vd0bY0Dg62czNVYUqs5GkuOmg+xQgpZZqfUWLPMV5UMbyIsRoTHii7D+xFXSUosEI3wSj3/wBWNmY7j2LhjJVTwkJUSwFpOCd2sTSKLZVurpV29NkkkkckVo9H8FcMaglx06gryy4lUS3aV0tx39IewegQ6Gj8ySSSSSSSSSSSSDOI1KqI3DuOhWdjIZQYo0yNoIHZtsiSrrd6j4eegokkkkkn0eSdxUJpriNjmShxIedBVWsi0oVEIVa5Sh0Uk4SX+1/VqxWlVxGcMrsYY8ZDorjxGNCq3wJPMcmBHdSSfRntltCGUFm6GNfGu6DpHWYsNADzkCuQcaEUJf4skMK0bKU7piD0s/wWwZxQkomcixpjSLQrNcNBmVdhLdL0eNxRIYEcDKI4EcCOBD/VACJDAjgRwMgyiOBDAjuCCPSoIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII2R/7x//2gAMAwEAAgADAAAAEAxaCLCJIAJIAJJAAAAAAAAABJIAJIABKBLCDKDKRYQZABIAJIAJIAAAJJJJIAAAJJAJIADKDKCLAR2JQRYRIABIAJIAAJJJJJJJIAABJAJIAJIBIAZQYLCBIRZQBIAJAABJJJJJJJJJIABJAJIAJAZYRYGBKDLAJABIAJAAJJJJJJJJJJJIABJAJIAJQZADKDYQJCLABJAJAAJJJJJJJJJJJJIABJAJABIBLCLQ7ARYBIAJAJAAJJJJJJJJJJJJJIABIAJABKDIAZRCDIRYAJAJIAJJJJJJAABJJJJJIABIBIAJAJQRKIQLCJABIBIAJJJJJAAAAABJJJJIAJIBIAJQJCLLAZQJABIBIABJJJIAAAAAAAJJJJIAJAJABIDKAZSDIRIAJAJABJJJIAAAAAAAAJJJJIAJAJAK8JQROQLCJAJAJABJJJIAAAAAAAAAJJJJABIBIIP8JCLyRYLABIBIAJJJIAAAAAAAAAAJJJJABBzSmGjIQYDIBYAJAJAJJJIAAAAAAAAAAAJJJIAJ6WSkAZQDAZCJABAJABJJJAAAAJJJIAAAAJJJABLYlwIBKAYBIRIBIBIAJJJAAAAJJJJJAAABJJJALT5ABKBQRALCJAJAJABJJIAAAJJJJJJAAAJJJIAbBIAJQJCCBYBABIBIBJJJAAAJJJJJJIAAAJJJBCIBABIDIQQLAIAJAJAJJJIAABJJJJJJIABJJAaSZAJAJAZCCBYJABIBABJJIAAAJJIAJAAJbbbKJBLIBIBIDIQQKBIAJAIAJJJAAAAIAISbSJYBRIJICZAJAJAJCCBYJABIBABJBABCbbTIJBBJIAKJJJATIBIBIDIQQLAIAJAJALTTARJBAJJBJJAAJRIJICZAJAJAZCCBYBABIBLbBIJKACJBJBIBIABCJAJA7IBABIDIQQLCJAJAJN5BZJQAQIJIJAJJAJRBQJDZBIAJQJCCBIRIBIBJ9ILJLAAADBCBCbTSaaDIBZAJABKBQRAZCJAJAJPoBRASTaSTBRJIBBAJJZIOIBIAIRKAYDIBYAJAIabDICILAIBBBIBIAJJDIDRAJAJAZQDARQLABIBLqIBJIAABABAJAJAAJJJAbIBABIDIQYQLCJAJAJUxAJJIIABAABAAAABIBACYBIAJQJCLyDIRIAJABmABIBJBIBJBBQBZCBDTSbAJADIBQRPQZQLABIBHySTSabSbaSaSTSSTJaBCAJABIDKAZYQLCJABIISBAAIAAJJBAAAAJIJIAJqBIAJQJCDLCBIRYAJADqAJBJBJIAAAJIJJRJABOBIAJAJQRKLQZYBIAJBcQKJDJJJBJJIJIJCJKBIQJABKDIAZRYQLCLABIKjBQAZJJAJBJJIBIZBRIaJABIALCLAxKDKAJABJd5CIDBCACIRAYLADACICZIAJQZQDKCLCBYRYQBIaQaBRAQIQCADBbJRAQJTIAJAJYRZSTZQZYRIAJHmDACALJBIJIJBACALAGYALKDIAZQYRYQJABIAJduaCRBRAJIJBAAIRJQBaABKDKCLKRwZKCLCLIAJ9uli/yTSTbaYKBDAABfABIAJCDKDLCLCDLCLIAIAbTaSbSbafTSTTbSS0QBIAJQRICPOCLCBJAJIABJAAJJJJKbJJILaTSSABJAZQQZQZXeRZQRIAJIABJAABJJBSZAJKRLYTABJQZYQZQZYxYRYQRYALIABJIAALaSbTzaSTbbWBJAZYQZQx4y5wRYQRYALIAAJJIAAAAAOAJJIABHIAZYQLKDKyy7wRYQRYCJJAABJJJIAAIPJJAAAJ+AZYALKDLGGybSZYQRZCBZCAAAJJJJJJbAAABJLaJYSDKCPGXWHLCLYQRLCBJJQAAAAAAAAYAAJJQDZYQDKGPWXfWHLCLYQRLAQLJIAAAAQCSH4LJKADHQQLKGPWWf8A1lzwi2EAi2SyWyRwgEkkk2+SAMESvkGygj0Eu8/1lzwgWUAiF2220Qa22222122AYkmsGShj0sO8t/1lzwkWQgG+yS0KTUk2222mQmSUAtmWgj0sO+ts+1lywsWQgG2W2gbOEkEkk2SR7W2WiUAz0EO/t9s+lly8ECyEAkSEDaCAAACSSAPaiGy0EzxkO/t/9s/1hi+Ei2QgAkTlmSSSS22QRXmSSgEWxkO/t/8A/bP9YLlgIFshIEkjEkkkgABIEAkhoZnsZbnrf/b/AG3/AFkuXwkC2SUBd+AkkkiSSRQWCMyWNhm+t/8Abb/bf9bLcvhNAJgA5EEkkkttgk0gBAZHJd/Lf/bbb/bd/rBZl4hIBsgkAAkkkkFogAkDI9r9/Lf/AG222/8Atn+tgsQ2SwgACGmm222SSyCQ2Mwcn1t/9ttttv8A7bv9bJfFvAlNogEkkkttsgtEZI5PZb//AG22222/+2z/AGtk/g2+ySS220gAANkCMkNl8tv/ALbbbbbbbf8A22f7WwS2ADb/ANttttkgBsmf2tltv/ttttttttt//ts/+lsEltiSWyWSQNsklu3/AJbf/bbbbbbbbbbb/wC22f8A2ltkgklttskgEtu3/wBbb/8A222222//xAAmEQEAAgAFAwQDAQAAAAAAAAABABEQITFQYUBBYFFxgJBwgZGh/9oACAEDAQE/EPtFLtVHKs+E2QLVTKc0yLJFNqL3XPQxvwVQLZpDbxMjNSxbuBJQjhEazz8EdIzWANZRH0zTUZmqmnH98Hegax+hM4dTtV+8ACjwdwoq3UAKDwph8Mnw18NYeGnwydkcDZ3ZHA2dh8WHA8NNlfyGfmysKlSvJq+lBLvOSCOnQqGs5IJ33dWvGPfHQ2Qx7BuzAdycpOUjFr0Lq7Zyk5SOxqbtkax21R0OqOOwjQ7t+lYlw89DlbhxLA53Yr7EEvRFqMNP36H/ABMrxnO/kD+7dq2VyvSAQd7n9HoTYcQEv0wHOaXu1fkg04tzzg9DHOM8opUsqbbug6wA06Snp9Gv/8QAKBEBAAIBAgUDBAMAAAAAAAAAAQARMSFAEEFQUXFgobEgMICQYZGg/9oACAECAQE/EP2iq0LjDXSI16IIqCdgTLawAUQoTrLk9CgrRMlpO4IJQr6MwhjkehDMAE/Rn1QWNzmdeh9H7QW1UwS5zOoq59E31quKq3/WC/nhX5bBWHAK0NiiocAitOn19giT3lSoSjsSUpUqEAO/VgFeU8s8sDGxBpHlnlhOOfVtfF8UsS2OEOKQlp1bP54/DsfcdZ2XzHayhdx8Ox9xBF4RKurzPCl0DZ5T4dj7yBRXCwhzXVgocM1BLngEsdiGtZ/IIpYQa/s6vkkyC9mKakUKV+jX/8QALBABAAIAAwYGAwEBAQEAAAAAAQARITFREEFhcaHwgZGxwdHhIFDxMEBggP/aAAgBAQABPxD/ANfX5V/9k1K21/8AAdZ7yLlffwU64xQiYOe/8QaC+5BLnVYOo/EuTRZx832qM7TzS18ZSeNI/wC/lLRWcILR6f8AhVJjmlBL8B3H1MPK5ei7Yt+Io1VS6zDsEWxubyFCi4K8zhBCBEx5bNvX/Q/QV/yu2rDFywhGmrurkbphJg3FYBjFybrhHNyJXdqJuOspRV33oy6QAKCg3H/hHAuIA1kHvOI0nBAaNSu0b9sw6yvAd5Z5ZQ6YMgUH/h7AM8EEPBDVYck20cT7cIMDchB+D/yn4n6zDaCA4WKObh8/8J+J+1xrlQSmMZRiQamAXnR/dr/sfsMp0jEnaY8I7jzH3j1gAe8fOF9cU386/dF9Nveb5eR6IPr2zFRnVmVfwjq0NyHADv2v4v8Aif6n4n/KgxBzZkJ5mJZeIPoRXpdPWov6a+UUy8ae09E6feb/ABwF7QHqU9Jmfx7MpMStXQXDwp3PaGTd8PrEI7dta9LhVUhpgDWGRjjM3fCn1UzrelTpGKta+xQie6GDe63EByJJhNVC/L/B/wCY/wAz8nq0amaeFaO45pfaI9gHqx3CcgnyVPxO+z4wue8B6TqVuYso8W5kQ+BL1g0V9IZV3JoPNIZM3f6kw1T130GJRt0yudTpVvqWC6GHoEz+zX1ZgxngY2dTpAKI0A2oEZiiFaZC9fj8KGaoQUWYHWBQBu/1f+E/E25EeYiW+83pPZB+8Vu8dD3naB0g8/BL7w2Qcj3mZblX0mcnOMyAZhgOUyXaZgRaSl2MOuNQypDvD6LMk3mOkXVGLpHqiWSlpqi2XvGenceyZNzL1TGyeOkzlyiEAG6OD+AvhP1/DA8XqT+HdWRDxMeX7fhzs3PG/wCWP/Ef7ha1wLqUb+daZ4PL7TODwAmfnxTNXmLmcB5SzSWguG/Bkt9pXs5yesQObtZW/Lem8c7+BM8OpV1VKtqcAdItmdYak7k0lVe4h707oE0JWFTCNH1NrijhFiOP029Y9JuOyna5QXwm6Nq0LDZ8DyL/AAfFugL7Q3rH5Ue34YU0jmDfb3/B/F/xPxP8i1MFKhE+oTdCix9BlNMLfrKTxFffVnSuz0EvguMfUmKNtErK0d5wYTQmhnpsSyp5D6q/Dtej+GG6h5P4YA7cdvUpl+zHa5MN8H0210uihseLp+FWHbj3lS/dL8LOHhOEwdvL8H/oPx4wqPBIqnTGcMyeeHvtF8BHrHz0eaPj8MXw9H4Mc7Lnv+Hkw9fwwD2W7evTLdmO3M5QW3RejaBYmaDABda+EfgY4l5JiH3/ABEpKAKmam7wicMS6wxrnNMPbQl3L1ovyfn+pjVrW9D3lDC9QHD9DwznSKhDUGbHygAMkvYbDVekG58Za9/wFd/misOpt5YttHNFzZWlgW2GP9nGuWM4pyfxE9z8REiKagdTHd+b5pXcni9iJAzlZL2iuKFbvF8SOgHgEO8J4HzKFB8HtF1pyeus96C94BxdwL7y/p/8SiPDW5b8iengPWb3uWesGU7+3sLWFDzLyw4QEtrQXtPU8PvPZAPeN5oC8j2iBK4j2IYEts8F4cvzfxf+bvHGG9NcTkIjQuJOZ7NJTS/wr1iwJZigxr6mh4h9pdk3iYtyp43xEKwui0PNgbgUVue8DmTn8UEyffQja2PBTd/yZ1vN9WAcXcDBMvZ7iHW9OTKu4wm8/sZs7/8A4wZTv7K5j05ie5rdB0iF7E6fEYVSqjcnuxisxQM74cIertPQgfZnnFNso3r1Yh6CANLeOM6Vwe06HwJg8D1mJtD1b2rQsPYPD5/B2eEoc4Lj0/RHAGk3n5QxLMz6JQGKsVAfFhurOO6Q4XElcCzNzUVnBAGr02HBvi5B8yukocDdAMkxuvpB9uOc7ZBxYJrbyDj9ZbQC8F7ToeFbORW6H4YeJ6Lbmcpk+zHb00OPoXrtVJ3lD4A9dqrkQYen5H8FDNUJgnNBAAGQV/u/8eg1HiL8zBuiUaEeb+bTyT0GKz4vIptFdguK+Cjq2+Ruok4nJ024mqfX8MHGPbmcplO3Hb0EGLwPXbU/B9IfA6RtVrhOIiPJe/4YTq3E5WfL9HW6T8xftMOrwmlVvkm0cw9Ue0daee/vtwaZusXIL399pz91vmO1wum0Y9F+rHZdTbh49NpyZku3Hb0cOLxPR2rA1wmLknQ23Tg+k5slzwPf8MK0Lg5D0P0dr/aV7xXqRNPbLxNorT9rzjrhfmPrb4cXFjoW8w2XK10W8hAEgoTF0UlXyT+eir7AZN75gcGtmmE4XynHeaU4vAOqcfzdiNXsRjC7nXGP2Hyie92cYDaLqYGYjnU3RDt+kQ7/AKSlgUYF1xOEuOlKWO6P0ax++/MMKBSrfrAI8AI8zfhlLMn5OXcr8vrLMk5D4mLbypr6EGIMA0Xifo1ALVUcd0GnhsrRRAShiwluXjkl2Xio94OhWqttnGVYgtzqi7dOY+Zdu+cDvZFbjBaA6tsekd8XjfaO9Hz+JkKIilN/UpzHl9onmfL7xRn4H3jQkaGpm5xL0cE81yh3y8vgi7ZGw9kuy5RfEEy5N+Esy8PBZExQSG7KAsk5yGyXn7jEuBDe/wBiibAsX4sNyXP5obnmPmhuVVQGh0pgbmtOEN34zBqciAJYIHEa0hRvwW7dlyzMuS+ZfmPKVmb8JLC+1ZD3lon1JRx/Ru0Bk3TymPUNEu5eMbhHcIN2gqB3wL6IEWF2O4buUTd7UMcOHGG/UBvl5j4jHALLcuAKPCx35MN8/P5IHvOaQdLAG7GucPjkWLwofeAe4WBZd1wjSvnA9piS0W0+IZY8jDIFyIBFbj8O/au3N73Tf6v0bVhcV8lDXHt81dq5ueVsF8c6Afhi2ts4wz29v0hxCnzx94POZx/byOw2d8JR2gE9tpsooLUPLbuDn6pcXG89tQNQdUufBOrtdaT1fw7Zq7fU9mZzX0jbRxX28YK4jeZtfAk9vGHx71HttuWgyp8pTteo3+ksntK9pyQuUaz6mw3wC4u+rXztNnwZUO+72i1z+ouUPTXttF+N9GKx0HXaq0Hovw7Zrty+ftM/rtK+OepOBBdDbdbVdT4h5jqY++1Vy6laJweHT9JxhE6TlRU4RA78dgsNRjudotuJHCcqeY2za5nqRVwjoO02uZFyw9NrrXLqfh2rXbk4z2vr7ca0p5p8ThcDb4sfO04LjptVU1ZhLdHWZH6S/TPk4R0aSRsVkQXhOO2bYwYUZ4fZCg7vnO7/ADLMOz4yqAAq0VOz/M7r8wNBQxLfOArSVyiyb+M718z+o+YFdrEHHnMyPo3VoE/oPmf3HzL+cSOS+fCfy35n8N+Z/PfmLyPMhvYTuX5navzKqKBZbjL+GSNmLP7DP6iCpqI8MTnP6Gf3PxP6T4gHKor5MesCAPM/E/vfif0vxFwdifpQOU3yx/SvOQiLinCWRR5escHg3iYdYTXrAuPWa3V+ZaWgsbEPHjFFVKwCjx29UKQ8YEN4baMLRAb/AOUuiVeBHde7lNXsuE7Q9ooWoY3RXSKvpajL44TV85Gv5uCaYhXmkDhkw1YOvPzApOgDgmr5OdXys0kysFEh1uVUqfFnV2B+1hCpgRkIcU1J+oJ1qwKiUlZVDgfZ+CY9mq2gLnnRMbcu4ZUr+mw6wY8kJXiPFN5DpxNtud5sFnR0r9o8H9c2+SPJ9oqHU2Cz1UdnF1B9tvUPSYOMvXaL5M4wN02vyno2vB7zj1fq7VzvTB2qg1Q82Gtqvlb8PAipyv8AzT4/TWyMI+MsAwSBQGzrMgwImrjCqICPiJDd09RkNQX6sF3JRBhxWN5MQQFYLiNQTeecwSeM+r4tuMdVHQdh97TfJnEReja+/o2vD4PqTBsi4TDvoPrtdA1HTH2gstOhHv8AgSod8TFMAPhn6/p1VwGK4HxY8PHMKi5lvCWU9CMt3p4pojGkXiQRGJXXks0F4xVl433lWTeCRFSLFKYlzVLkpxDkYmIp4qYZFqrVhPkNNyPOA3BWyJCYG/KyCC7oE18yNKmTcxgm8eEE+ktpKqsb1gfIBHdB8oFlTNaIXAFnXghB8m8ZZrKjhbq+ZUWm7eGwSwDjAR3+cJwC1wCWNkL5nF/UUQOguLWc2xXLwD4juFzBjuxzt7xLNc0e8RzPOyOW8R+I+mUOs8vkjnPCT3jn/CbHJLs0j1+Im+BzIb4QfcisiHMd8EAEFAGARzo5iOaXmZlRlWGBpNI8lJdvnL5In1hmkxHWLsxDkXLsh3aTRXO3tH7jOJbeXXpPvYVZrmj3mknMYbEM2LXHdGuW4J7THGWgqFBRKo8MSa6/t0HMhJOO1pme8oyHzlP6mDJG0acJuSci94vLkPki8nkfOI7A8I7r87e0VunMPvEveknm+bPePVNT2jlu1aRynhP4i1HAgWfkSlt8iWVuEKOe94xcS992dPmEjrvJ5ftsAtzbrbSiBM7vujc0a5zh/OARBuKTt/Sdn6Ts/ScH25Tg+3KcD25TtnxO8/E7j8T+z+J/d/EWbexynARl59IqNvcOECAFh/GCMxo/t6uEbGgnnO6PmcD5JwXknD+Sfzk/iJ/CSrPkDiaWZRT7KyC6XOFPg7FeL28pxu/lP7P4n9n8T+/+J/XfE/uvif0XxF9A3Y3WO70pHBIxEAvgfP74Fh0DBmK3Xe8ODxhS8FK5nc/6KSg5m7pLR12JuYVHSlDR/c3Lly9gU54jowgNPiawQyn/AEMj3vJgV/p/fs4Md8yG5/0KplNIZY/v0RO6ziQhtg6/6PR3MBIuf725cK+ttMVGGDFTUc6fSNVg5mj/AJ1XeFkALAljBBzyef6hAxidfwlPplPplPplPplPplPplfpiVhpCjphOx8ENWPDNx04Sv0yv0wQxPHFP6mf1M/qZ/Uz+pn9TMtbwvD7AORA25BWSKLq1DR3Mr9Mr9Mr9JN+iVITt/BEhHoBs82d8J3wnbJ2wlmXhheUsFwYpYlwNnM/T4+FMGrug0bMaCoKSCxuX5yz8nMYhCYQLFqZM5VbSV0lGglG8t9eP4CEKjM/8KlKUpSkMpqg94Q7FQ3QBYoq96fzk/lIEPuN9e+V0ldI8gQBTgw1n8s+Z/LPmfyD5hYFxQPWIakiYlDhnEAdw82v04QhLN+GHvGsTtG/TrOxXzOxXzOzXzO7XzO7XzO7XzFEqBgWFxwBF6hvHDFxek4M+DOrIKJYNyEwI+LunBRTyzlf4/Mr/AB+ZaFcxHQOc7n0nc+k7n0nc+k7n0nc+k7n0j2D8Ewm+RQDwud2vmd2vmNMBjRBqFNvODyShJ5qTgz4M3okRV8qweJFhCFCNOl752K+Z2K+Z2a+YgXA2C1ulZD6NB/TuAcVbJ4R6lTfRPM/MxjWta9rynFaMsdGabraiAgUAnFvKerKFWcgFlmf+vve973ve9a1cmKNBbR1ZkByQUFljHJ057US7ZmFwCFcGK4pgBtMYZ9iCKdQfQuYMi5r9coCrQZrHmWS5tpmPjO3SUlI7eCCk5suBAGG59ogG7XBY+Pzv8lio4sBPUID60/qOYpRetykpDos3AfHD4SN4Sgc4enBP197XfWwHEc/Nw5XLawl15EpuaylleTfLZeNLICrZpbjL6mCQGg1gcqCn18f9Q3VWrTFRnt04EZUtxBWMAVWQSq9qinUcTpMIiixN8ZBYpXAz3CuYfsnc2R9ALeqzg8OZwJmLjcXfMUcDG9YAnwWkcvEA8S2yUhklkZ7jH0cexp/q6dWfgtvQYDC2eUHHBXvSVZlJhesCrTGnjuUdXb5xl6MT6kg1G5klIck/XXLlzCBXyEE9YWtvJyshepZmZtOcII2shHiSlHHFXAaruIgQGYWb4bvMR8oITAp4pr0ZcuXLly5cuXLly4SSxHJQ94EKtvVcnGUezGWvS9yTj/ExRpK4LgGmkx/eGMVqEzRlcwbLly9l/pbl/iGCiT6YPWnkxZjXhwgRwGw3PmEA1QYfNpmVsPh50qFhpbL8Igt4zeKl8UHzf9X/AO4u+6xvKi1CBpHcwMlKgzdXhFzyIvITBrsRBp1CiJxWgPQ0IbqXim9QU4DwMZ+PGUPyhcv9HcWMMsNIk3xUBZFiOT3uWN0TTom5HeMvlO5izZWjQIzYTcqPImCcCgMAhpth3GgcWCIDlwBQQDvhbfOac2xzTmnNOac+wg3xBvl4Wo2fm8n1lIQ0ojNKvwymuNABE8EWbbXjK3qKBirAHFJXy+be/UE3wDvhbYIJIH9Gx2FYs0ooXHBy+GPp4RYi8vVZvK45wsYZetrrMIg71rfsQBDcje6rvY+KPii3oLLZbLZbLZbLYmot2Pig0jUCxIoVVtfDxbuTHKqdV8xhBNm0FHCz7qvXF8JUxcgw5XvMGEi37im1QuDC9g/SMSMsNoh3RTdF44acLs/DQGAN0CboV3TlnLOWcs5ZyzlnLOWId0U3RgV2NwG2cOAN0AboV2CSQgfpKlSpUp+b9NJWVlZWVlZWVlZWV029ZWVlZXb1ldpTYrYr9RUqV+FSpUqVKlSpUqVKlSpUrbUqVK21K/Cv2ty5cuX/AOTv9B//2Q==";

     return (
        <div className="background">
            <div className="sidebar-adminVendaList">
                <SidebarSection title="Pesquisa Avançada">
                    <div className="search-adminVendas">
                        <input
                            type="text"
                            placeholder="Número da venda"
                            value={filtroNrVenda}
                            onChange={(e) => setFiltroNrVenda(e.target.value)}
                            className="sidebar-search-input-adminVendaList"
                        />
                    </div>
                    <div className="search-adminVendas">
                        <input
                            type="text"
                            placeholder="Nome do produto"
                            value={filtroProduto}
                            onChange={(e) => setFiltroProduto(e.target.value)}
                            className="sidebar-search-input-adminVendaList"
                        />
                    </div>
                    <div className="search-adminVendas">
                        <input
                            type="text"
                            placeholder="Username do utilizador"
                            value={filtroUsername}
                            onChange={(e) => setFiltroUsername(e.target.value)}
                            className="sidebar-search-input-adminVendaList"
                        />
                    </div>
                    <div className="search-adminVendas">
                        <input
                            type="date"
                            placeholder="Pesquisar por data"
                            value={filtroData}
                            onChange={(e) => setFiltroData(e.target.value)}
                            className="sidebar-search-input-adminVendaList"
                        />
                    </div>
                    <div className="sidebar-dropdown-adminVendaList">
                        <select
                            value={filtroPeriodo}
                            onChange={(e) => setFiltroPeriodo(e.target.value)}
                        >
                            <option value="">Selecionar Período</option>
                            <option value="ultima-semana">Última Semana</option>
                            <option value="ultimo-mes">Último Mês</option>
                            <option value="ultimos-3-meses">Últimos 3 Meses</option>
                            <option value="ultimo-ano">Último Ano</option>
                            <option value="mais-antigo">Mais Antigo</option>
                        </select>
                    </div>
                </SidebarSection>
                <SidebarSection title="Ordenar por">
                    <div className="sidebar-dropdown-adminVendaListe">
                        <select
                            value={orderBy}
                            onChange={(e) => setOrderBy(e.target.value)}
                        >
                            <option value="">Selecionar Preço</option>
                            <option value="preco-asc">Mais baixo para mais alto</option>
                            <option value="preco-desc">Mais alto para mais baixo</option>
                        </select>
                    </div>
                </SidebarSection>
                <SidebarSection title="Estado">
                    <div className="search-adminVendas">
                        <label>
                            <input
                                type="radio"
                                value="todos"
                                checked={filtroEstado === 'todos'}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                            />
                            Todos
                        </label>
                    </div>
                    <div className="search-adminVendas">
                        <label>
                            <input
                                type="radio"
                                value="carrinho"
                                checked={filtroEstado === 'carrinho'}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                            />
                            Carrinho
                        </label>
                    </div>
                    <div className="search-adminVendas">
                        <label>
                            <input
                                type="radio"
                                value="finalizada"
                                checked={filtroEstado === 'finalizada'}
                                onChange={(e) => setFiltroEstado(e.target.value)}
                            />
                            Finalizada
                        </label>
                    </div>
                </SidebarSection>
            </div>
            <div className="adminVenda-list-container">
                <div className="adminVenda-list">
                    <h2>Vendas Concluídas</h2>
                    <InfiniteScroll
                        dataLength={filteredVendas.length}
                        next={loadMoreVendas}
                        hasMore={hasMore}
                        loader={<p style={{ textAlign: 'center' }}>Carregando...</p>}
                        endMessage={<p style={{ textAlign: 'center' }}>Você viu todas as vendas!</p>}
                        scrollThreshold={0.9} // Carregar mais quando 90% do conteúdo estiver visível
                    >
                        <ul>
                            {filteredVendas.map((venda) => {
                                const produtoComMaiorQuantidade = venda.produtos.length > 0
                                    ? venda.produtos.reduce((prev, curr) =>
                                        (curr.quantidade > prev.quantidade ? curr : prev),
                                        venda.produtos[0]
                                    )
                                    : { nome: '', imagem: '' }; // Fallback caso não haja produtos

                                return (
                                    <li key={venda.nrVenda}>
                                        <Link
                                            to={`/admin/vendas/${venda.nrVenda}`}
                                            className="adminVenda-link"
                                        >
                                            <div className="adminVenda-info">
                                                <div className="adminVenda-images">
                                                    {venda.produtos.length > 0 ? (
                                                        <img
                                                            src={produtoComMaiorQuantidade.imagem}
                                                            alt={`Imagem de ${produtoComMaiorQuantidade.nome}`}
                                                            className="adminVenda-product-image"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={emptyCartBase64}
                                                            alt="Carrinho vazio"
                                                            className="adminVenda-product-image"
                                                        />
                                                    )}
                                                </div>
                                                <div className="adminVenda-details">
                                                    <div className="adminVendaleft-details">
                                                        <strong>Número da Venda:</strong> {venda.nrVenda} <br />
                                                        <strong>Produtos:</strong> {venda.produtos.length > 0 ? venda.produtos.map((produto) => produto.nome).join(', ') : 'Sem produtos'} <br />
                                                        {venda.produtos.length > 0 && (
                                                            <div>
                                                                <strong>Quantidade:</strong> {venda.produtos.map((produto) => produto.quantidade).join(', ')} <br />
                                                                <strong>Total:</strong> {venda.total.toFixed(2)} € <br />
                                                            </div>
                                                        )}
                                                        <strong>Data:</strong> {new Date(venda.data).toLocaleDateString()} <br />
                                                    </div>
                                                    <div className="adminVendaright-details">
                                                        <div><strong>Utilizador:</strong> {venda.cliente.usernameUtilizador}</div>
                                                        <div><strong>Estado:</strong> {venda.estado}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </InfiniteScroll>
                </div>
            </div>
        </div>
    );
}

export default AdminVendaList;
