const fallbackTeams = {
  maxTeams: 12,
  activeTeams: Array.from({ length: 12 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return { id: `team${number}`, label: `${index + 1}팀`, status: "empty" };
  })
};

export async function loadTeams(url) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn("팀 데이터를 불러오지 못해 기본 팀 목록을 사용합니다.", error);
    return fallbackTeams;
  }
}
