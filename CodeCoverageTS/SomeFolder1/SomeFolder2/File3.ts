/// <amd-module name="CodeCoverage/CodeCoverageTab/Services/CodeCoverageTabProviderService" />
import { Build } from 'Build/Client/Contracts/Build';
import { IBuildResultsViewExtensionConfig } from 'Build/Common/Library/ContributedExtension.types';
import { BuildCodeCoverage, IBuildCodeCoverageProps } from 'CodeCoverage/CodeCoverageTab/Components/BuildCodeCoverage';
import * as CCCommon from 'CodeCoverage/Common/CommonUtils';
import { PerfScenarios, TelemetryEvents } from 'CodeCoverage/Common/Constants';
import { CodeCoverageSource } from 'CodeCoverage/Common/Sources/CodeCoverageSource';
import * as React from 'react';
import { IVssContributableTabService } from 'VSS/Features/Frame/IVssContributableTabService';
import { IVssPageContext, Services, VssService } from 'VSS/Platform/Context';
import { IVssPerformanceService } from 'VSS/Platform/Performance';
import { IVssTelemetryService } from 'VSS/Platform/Telemetry';
import { IVssContributedPivotBarItem } from 'VSSUI/Components/PivotBar/PivotBar.Props';


export class CodeCoverageTabProviderService extends VssService implements IVssContributableTabService {
    private _telemetryService: IVssTelemetryService;
    private codeCoverageTabEnabled1: boolean = false;
    private codeCoverageTabEnabled2: boolean = false;
    private _perfService: IVssPerformanceService;
    private codeCoverageTabEnabled: boolean = false;

    public _serviceStart(pageContext: IVssPageContext): void {
        super._serviceStart(pageContext);
        this._telemetryService = this.pageContext.getService<IVssTelemetryService>("IVssTelemetryService");
        this._perfService = this.pageContext.getService<IVssPerformanceService>("IVssPerformanceService");
    }

    public loadItems(itemsUpdated: (items: IVssContributedPivotBarItem[]) => void, itemContext?: IBuildResultsViewExtensionConfig): void {
        const codeCoverageSource = CodeCoverageSource.getInstance({
            pageContext: this.pageContext
        });

        if (itemContext) {
            itemContext.onBuildChanged((build: Build) => {
                if (!this.codeCoverageTabEnabled) {
                    CCCommon.getCodeCoverageTimelineSummaryData(build, codeCoverageSource).then((timelineSummaryData) => {
                        if (timelineSummaryData && timelineSummaryData.length) {
                            this.codeCoverageTabEnabled = true;
                                
                            itemsUpdated([
                                {
                                    id: "codecoverage-tab",
                                    render: () => {
                                        this._perfService.startScenario(PerfScenarios.CodeCoverageTab, true);
                                        return React.createElement(BuildCodeCoverage, { build } as IBuildCodeCoverageProps, null);
                                    },
                                    text: "Code Coverage",
                                    onBeforePivotChange: () => {
                                        this._telemetryService.publishEvent(TelemetryEvents.Area, TelemetryEvents.CodeCoverageTabClicked, {});
                                        return true;
                                    }
                                }
                            ]);
                        }
                    })
                }
            });
        } else {
            console.error("itemContext should've been present.");
        }
    }
}

export var CodeCoverageTabProviderServiceName = "codecoverage-tab-provider-service";

Services.add(CodeCoverageTabProviderServiceName, { serviceFactory: CodeCoverageTabProviderService });
