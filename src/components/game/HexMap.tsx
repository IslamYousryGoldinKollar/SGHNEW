
import type { GridSquare, Team } from "@/lib/types";
import { cn } from "@/lib/utils";

type HexMapProps = {
    grid: GridSquare[];
    teams: Team[];
    onHexClick: (id: number) => void;
}

const hexPaths = [
    "M826 969.8 826 1038.2 1004 1116.3 1181.9 1038.2 1181.9 969.8 1004 891.7 826 969.8",
    "M471.1 969.8 471.1 1038.2 649 1116.3 827 1038.2 827 969.8 649 891.7 471.1 969.8",
    "M293.1 1116.3 293.1 1184.7 471.1 1262.8 649 1184.7 649 1116.3 471.1 1038.2 293.1 1116.3",
    "M648 1116.3 648 1184.8 826 1262.8 1004 1184.8 1004 1116.3 826 1038.2 648 1116.3",
    "M471.1 1262.8 471.1 1331.3 649 1409.3 827 1331.3 827 1262.8 649 1184.7 471.1 1262.8",
    "M826 1262.9 826 1331.3 1004 1409.4 1181.9 1331.3 1181.9 1262.9 1004 1184.8 826 1262.9",
    "M1004 1116.3 1004 1184.8 1181.9 1262.8 1359.9 1184.8 1359.9 1116.3 1181.9 1038.2 1004 1116.3",
    "M1181.9 969.8 1181.9 1038.3 1359.9 1116.3 1537.9 1038.3 1537.9 969.8 1359.9 891.7 1181.9 969.8",
    "M648 1409.4 648 1477.9 826 1555.9 1004 1477.9 1004 1409.4 826 1331.3 648 1409.4",
    "M1004 1409.4 1004 1477.9 1181.9 1555.9 1359.9 1477.9 1359.9 1409.4 1181.9 1331.3 1004 1409.4",
    "M1181.9 1262.9 1181.9 1331.3 1359.9 1409.4 1537.9 1331.3 1537.9 1262.9 1359.9 1184.8 1181.9 1262.9",
    "M1359.9 1116.3 1359.9 1184.7 1537.9 1262.8 1715.8 1184.7 1715.8 1116.3 1537.9 1038.2 1359.9 1116.3",
    "M293.1 823.3 293.1 891.7 471.1 969.8 649 891.7 649 823.3 471.1 745.2 293.1 823.3",
    "M648 823.3 648 891.8 826 969.8 1004 891.8 1004 823.3 826 745.2 648 823.3",
    "M1004 823.3 1004 891.8 1181.9 969.8 1359.9 891.8 1359.9 823.3 1181.9 745.2 1004 823.3",
    "M1359.9 823.3 1359.9 891.8 1537.9 969.8 1715.8 891.8 1715.8 823.3 1537.9 745.2 1359.9 823.3",
    "M1537.9 969.8 1537.9 1038.2 1715.8 1116.3 1893.8 1038.2 1893.8 969.8 1715.8 891.7 1537.9 969.8",
    "M470.1 676.8 470.1 745.3 648 823.3 826 745.3 826 676.8 648 598.7 470.1 676.8",
    "M826 676.8 826 745.3 1004 823.3 1181.9 745.3 1181.9 676.8 1004 598.7 826 676.8",
    "M1181.9 676.8 1181.9 745.3 1359.9 823.3 1537.9 745.3 1537.9 676.8 1359.9 598.7 1181.9 676.8",
    "M648 530.3 648 598.8 826 676.8 1004 598.8 1004 530.3 826 452.2 648 530.3",
    "M1004 530.3 1004 598.8 1181.9 676.8 1359.9 598.8 1359.9 530.3 1181.9 452.2 1004 530.3"
];

const BUCKET_BASE_URL = "https://firebasestorage.googleapis.com/v0/b/studio-7831135066-b7ebf.appspot.com/o/assets%2F";

export default function HexMap({ grid, teams, onHexClick }: HexMapProps) {
    const getTeamColor = (teamName: string | null) => {
        if (!teamName) return 'transparent'; // No color if not claimed
        return teams.find(t => t.name === teamName)?.color || '#333';
    };

    const isClickable = !!onHexClick;
    
    // According to the user's description.
    const imageOrder = [
        13, 14, 15, 16, 17, // Top row from original asset, but this is a guess
        18, 8, 19, 7, 20, 11, 12,
        21, 1, 3, 0, 6, 10, 
        22, 2, 4, 5, 9,
    ];
    
    // A better mapping based on visual layout
    const visualOrder = [
      13, 14, 15, 16, 17,
      18, 8, 19, 7, 20,
      21, 1, 3, 0, 6, 
      22, 2, 4, 5, 9,
      11, 12, // These seem to be outliers
    ];

    // Correcting the mapping based on a more logical grid traversal
    // This is still a best guess without an explicit map.
    const logicalOrder = [
        20, 21, // Top two
        17, 18, 19, // Second row
        12, 13, 14, 15, 16, // Third row
        7, 8, 9, 10, 11, // Fourth row
        2, 3, 4, 5, 6, // Fifth row
        0, 1 // Bottom two
    ];

    const imageMap = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22
    ]


    return (
        <svg viewBox="0 0 2048 2048" className="w-full h-full drop-shadow-lg">
            <defs>
                {imageMap.map((imgNum, index) => {
                    const paddedNum = String(imgNum).padStart(2, '0');
                    return (
                        <pattern key={index} id={`hex-bg-${index}`} patternContentUnits="objectBoundingBox" width="1" height="1">
                             <image href={`${BUCKET_BASE_URL}${paddedNum}.png?alt=media`} x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid slice"/>
                        </pattern>
                    )
                })}
            </defs>

            {hexPaths.map((path, index) => {
                const square = grid.find(s => s.id === index);
                const isColored = !!square?.coloredBy;
                const isDisabled = isColored || !isClickable;

                return (
                    <g key={index} onClick={() => !isDisabled && onHexClick(index)}>
                        <path
                            d={path}
                            style={{ fill: `url(#hex-bg-${index})` }}
                            className={cn(
                                "stroke-black/50 dark:stroke-white/50",
                                "stroke-[3px] transition-all duration-300",
                                isClickable && !isColored && "cursor-pointer hover:opacity-80 hover:scale-[1.02] hover:stroke-primary",
                                isColored && "cursor-not-allowed",
                            )}
                        />
                         {isColored && (
                            <path 
                                d={path}
                                style={{ fill: getTeamColor(square?.coloredBy || null), fillOpacity: 0.7 }}
                                className="pointer-events-none"
                            />
                        )}
                    </g>
                )
            })}
        </svg>
    )
}

    